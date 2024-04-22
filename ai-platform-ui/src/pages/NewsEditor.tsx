import { Button } from "@/components/shadcn/ui/button";
import { Slider } from "@/components/shadcn/ui/slider";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { ReloadIcon } from "@radix-ui/react-icons";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/ui/form";
import { Card } from "@/components/shadcn/ui/card";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";
import "@mantine/core/styles.css";
import { DefaultBlockSchema, PartialBlock } from "@blocknote/core";
import {
  BlockNoteView,
  useCreateBlockNote,
  lightDefaultTheme,
  darkDefaultTheme,
  Theme,
} from "@blocknote/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { useTheme } from "@/contexts/ui-theme";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { fetchPostLLMChat } from "@/apis/llm";
import { LLMModelEnum } from "@/types/llm";

const formSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "長度至少要 5 個字",
    })
    .max(100, {
      message: "長度最多 100 個字",
    }),
  content: z
    .string()
    .min(5, {
      message: "長度至少要 5 個字",
    })
    .max(500, {
      message: "長度最多 500 個字",
    }),
  length: z.string(),
  temperature: z.number().min(0).max(1),
});

const NewsGeneratorFormCard = (props: {
  onSubmit?: (data: z.infer<typeof formSchema>) => void;
  loading?: boolean;
  disabled?: boolean;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      length: "short",
      temperature: 0.5,
    },
    mode: "onBlur",
  });

  return (
    <Card className="flex-shrink-0 w-[300px] py-6 max-h-full overflow-hidden">
      <Form {...form}>
        <form
          onSubmit={props.onSubmit && form.handleSubmit(props.onSubmit)}
          className="flex flex-col h-full max-h-full overflow-hidden"
        >
          <ScrollArea className="h-full mb-8">
            <div className="flex flex-col space-y-8 px-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新聞內容大綱</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={props.disabled || props.loading}
                        {...field}
                        rows={8}
                        className="resize-none"
                      />
                    </FormControl>
                    <span className="text-xs block text-right text-muted-foreground">
                      {field.value.length} / 100
                    </span>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新聞內容</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={props.disabled || props.loading}
                        rows={8}
                        className="resize-none"
                      />
                    </FormControl>
                    <span className="text-xs block text-right text-muted-foreground">
                      {field.value.length} / 500
                    </span>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>文章長度</FormLabel>
                    <FormControl>
                      <Tabs
                        defaultValue={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                        }}
                      >
                        <TabsList className="grid w-full grid-cols-3">
                          {[
                            { value: "short", text: "短" },
                            { value: "medium", text: "中" },
                            { value: "long", text: "長" },
                          ].map((tab) => (
                            <TabsTrigger
                              key={tab.value}
                              value={tab.value}
                              disabled={props.disabled || props.loading}
                            >
                              {tab.text}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>創意程度 {field.value}</FormLabel>
                    <Slider
                      disabled={props.disabled || props.loading}
                      defaultValue={[field.value]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={(val) => {
                        field.onChange(val[0]);
                      }}
                    />
                  </FormItem>
                )}
              />
            </div>
          </ScrollArea>
          <div className="px-6">
            <Button
              disabled={props.disabled || props.loading}
              type="submit"
              className="w-full relative z-20 flex-shrink-0"
            >
              {props.loading && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              產生新聞稿
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

const transformTextToBlock = (text: string) => {
  const blockSchemas = [
    { reg: /^# /, block: { type: "heading", props: { level: "1" } } },
    { reg: /^## /, block: { type: "heading", props: { level: "2" } } },
    { reg: /^### /, block: { type: "heading", props: { level: "3" } } },
  ];

  return text.split("\n").map((line) => {
    for (const schema of blockSchemas) {
      if (schema.reg.test(line)) {
        const trimmedText = line.replace(schema.reg, "");
        return {
          ...schema.block,
          content: [{ type: "text", text: trimmedText, styles: {} }],
        };
      }
    }

    return {
      type: "paragraph",
      content: line,
    };
  }) as PartialBlock<DefaultBlockSchema>[];
};

const NewsEditor = () => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  const background = computedStyle.getPropertyValue("--background").trim();
  const foreground = computedStyle.getPropertyValue("--foreground").trim();

  const theme = useTheme();
  const editor = useCreateBlockNote({
    defaultStyles: true,
  });

  const postNewsGenerator = useMutation({
    mutationKey: fetchPostLLMChat().key,
    mutationFn: fetchPostLLMChat().fetchFn,
    onSuccess: ({ data }) => {
      editor.removeBlocks(editor.document);

      const blocks = transformTextToBlock(data?.message);
      editor.insertBlocks(blocks, editor.document[0], "before");
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const systemPrompt = "請幫我寫一篇新聞稿，內容如下";
    const userPrompt = `新聞大綱：${data.title}\n 新聞內容參考${data.content}\n 文章長度：${data.length}\n`;

    postNewsGenerator.mutate({
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      temperature: data.temperature,
      model: "models/gemini-1.0-pro",
      llm_type: LLMModelEnum.GEMINI,
    });
  };

  let blockTheme = import.meta.env.VITE_APP_DEFAULT_THEME;
  if (theme.theme === "light" || theme.theme === "dark") {
    blockTheme = theme.theme;
  } else if (
    theme.theme === "system" ||
    (!theme.theme && blockTheme === "system")
  ) {
    blockTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  const blockLightTheme = {
    ...lightDefaultTheme,
    colors: {
      ...lightDefaultTheme.colors,
      editor: {
        text: foreground,
        background,
      },
    },
  } satisfies Theme;

  const blockDarkTheme = {
    ...darkDefaultTheme,
    colors: {
      ...darkDefaultTheme.colors,
      editor: {
        text: foreground,
        background,
      },
    },
  } satisfies Theme;

  return (
    <div className="flex space-x-6 h-[calc(100dvh_-_128px)] max-h-[calc(100dvh_-_128px)] overflow-hidden">
      <Card className="flex-grow max-h-full overflow-hidden">
        <ScrollArea className="p-6 h-full">
          <BlockNoteView
            editor={editor}
            theme={blockTheme === "light" ? blockLightTheme : blockDarkTheme}
          />
        </ScrollArea>
      </Card>

      <NewsGeneratorFormCard
        onSubmit={handleSubmit}
        loading={postNewsGenerator.isPending}
      />
    </div>
  );
};

export default NewsEditor;
