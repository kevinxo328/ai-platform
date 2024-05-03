import { Card } from "@/components/shadcn/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import ChatMessages from "@/components/Chat/ChatMessages";
import { useEffect, useRef, useState } from "react";
import { fetchPostLLMChat, fetchGetLLMModelList } from "@/apis/llm";
import { MessageTypeEnum, RoleEnum } from "@/types/chat";
import { Button } from "@/components/shadcn/ui/button";
import { PaperPlaneIcon, TrashIcon, UploadIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { toast } from "sonner";
import { Slider } from "@/components/shadcn/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/ui/accordion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import clsx from "clsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchGetPrompts } from "@/apis/prompts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/ui/command";
import SavePromptDialog from "@/components/Dialog/SavePromptDialog";
import { getApiUrl } from "@/libs/apiClient";
import { Label } from "@/components/shadcn/ui/label";
import { Switch } from "@/components/shadcn/ui/switch";
import { LLMModelEnum, ReqLLMChat } from "@/types/llm";
import { useStore } from "@/store/store";

const formSchema = z.object({
  systemPrompt: z.string(),
  userPrompt: z.string(),
  temperature: z.number().min(0).max(1),
  model: z.string(),
});

const ChatPlayground = () => {
  const isComposition = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userPromptInput = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const [openSavePromptDialog, setOpenSavePromptDialog] = useState(false);
  const [isOpenAIStream, setIsOpenAIStream] = useState(true);
  const [openPromptsPopover, setOpenPromptsPopover] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt: "請協助回答使用者的問題",
      userPrompt: "",
      temperature: 0.5,
      model: "",
    },
    mode: "onBlur",
  });
  const addMessage = useStore((state) => state.addMessage);
  const messages = useStore((state) => state.messages);
  const resetMessages = useStore((state) => state.resetMessages);
  const setIsStreaming = useStore((state) => state.setIsStreaming);
  const isStreaming = useStore((state) => state.isStreaming);

  const getModelList = useQuery({
    queryKey: fetchGetLLMModelList().key,
    queryFn: fetchGetLLMModelList().fetchFn,
    staleTime: 1000 * 60 * 30,
    select: (res) => res.data,
  });

  const getPrompts = useQuery({
    queryKey: fetchGetPrompts().key,
    queryFn: fetchGetPrompts().fetchFn,
    staleTime: 1000 * 60 * 30,
    select: (res) => res.data,
  });

  const postLLMChat = useMutation({
    mutationFn: fetchPostLLMChat().fetchFn,
    mutationKey: fetchPostLLMChat().key,
    onSuccess: ({ data }) => {
      addMessage({
        message: data?.message,
        role: RoleEnum.ai,
        messageType: MessageTypeEnum.text,
      });
    },
    onError: (error) => {
      addMessage({
        message: `LLM 發生錯誤: ${error.response?.data?.detail}`,
        role: RoleEnum.ai,
        messageType: MessageTypeEnum.text,
      });
    },
  });

  const postLLMChatStream = async (body: ReqLLMChat) => {
    try {
      setIsStreaming(true);
      const res = await fetch(getApiUrl("/llm/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.status !== 200) {
        setIsStreaming(false);
        addMessage({
          message: "LLM 發生錯誤",
          role: RoleEnum.ai,
          messageType: MessageTypeEnum.text,
        });
        return;
      }

      if (!res.body) {
        setIsStreaming(false);
        return;
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsStreaming(false);
          break;
        }

        addMessage({
          message: value.replace(/data: /g, ""),
          role: RoleEnum.ai,
          messageType: MessageTypeEnum.text,
        });
      }
    } catch (e: any) {
      setIsStreaming(false);
      addMessage({
        message: `LLM 發生錯誤: ${e?.message?.detail}`,
        role: RoleEnum.ai,
        messageType: MessageTypeEnum.text,
      });
    }
  };

  // const postAOAIWhisper = useMutation({
  //   mutationFn: fetchPostAOAIWhisper().fetchFn,
  //   mutationKey: fetchPostAOAIWhisper().key,
  //   onSuccess: ({ data }) => {
  //     addMessage({
  //       message: data?.message,
  //       role: RoleEnum.human,
  //       messageType: MessageTypeEnum.text,
  //     });
  //     if (isOpenAIStream) {
  //       postLLMChatStream({
  //         user_prompt: data.message,
  //         system_prompt: form.getValues("systemPrompt"),
  //         temperature: form.getValues("temperature"),
  //         model: form.getValues("model"),
  //         stream: true,
  //       });
  //     } else {
  //       postLLMChat.mutate({
  //         user_prompt: data.message,
  //         system_prompt: form.getValues("systemPrompt"),
  //         temperature: form.getValues("temperature"),
  //         model: form.getValues("model"),
  //       });
  //     }
  //   },
  //   onError: (error: ServiceError) => {
  //     addMessage({
  //       message: `語音轉文字發生錯誤: ${error?.response?.data?.detail}`,
  //       role: RoleEnum.ai,
  //       messageType: MessageTypeEnum.text,
  //     });
  //   },
  // });

  // const postSttFromFile = usePostSttFromFile({
  //   onSuccess: ({ data }) => {
  //     addMessage({
  //       message: data?.message,
  //       role: RoleEnum.human,
  //       messageType: MessageTypeEnum.text,
  //     });

  //     if (isOpenAIStream) {
  //       postLLMChatStream({
  //         user_prompt: data.message,
  //         system_prompt: form.getValues("systemPrompt"),
  //         temperature: form.getValues("temperature"),
  //         model: form.getValues("model"),
  //         stream: true,
  //       });
  //     } else {
  //       postLLMChat.mutate({
  //         user_prompt: data.message,
  //         system_prompt: form.getValues("systemPrompt"),
  //         temperature: form.getValues("temperature"),
  //         model: form.getValues("model"),
  //       });
  //     }
  //   },
  //   onError: (error) => {
  //     addMessage({
  //       message: `語音轉文字發生錯誤: ${error?.response?.data?.detail}`,
  //       role: RoleEnum.ai,
  //       messageType: MessageTypeEnum.text,
  //     });
  //   },
  // });

  const handleSubmit = () => {
    if (
      postLLMChat.isPending ||
      isStreaming ||
      // postSttFromFile.query.isPending ||
      // postAOAIWhisper.isPending ||
      !form.getValues("userPrompt") ||
      !form.getValues("model")
    )
      return;
    addMessage({
      message: form.getValues("userPrompt"),
      role: RoleEnum.human,
      messageType: MessageTypeEnum.text,
    });

    form.handleSubmit((data) => {
      const params = {
        user_prompt: data.userPrompt,
        system_prompt: data.systemPrompt,
        temperature: data.temperature,
        model: data.model.split(",")[1],
        llm_type: data.model.split(",")[0] as LLMModelEnum,
        stream: isOpenAIStream,
      };
      if (isOpenAIStream) {
        postLLMChatStream(params);
      } else {
        postLLMChat.mutate(params);
      }
    })();
    form.resetField("userPrompt");
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !isComposition.current) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   uploadButtonRef.current!.blur();
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   fileInputRef.current!.value = "";

  //   if (file.type !== "audio/wav") {
  //     toast.error("上傳錄音檔失敗", {
  //       description: "請上傳 wav 格式的檔案",
  //     });
  //     return;
  //   }
  //   // postAOAIWhisper.mutate(file);
  // };

  // Reset messages when unmount
  useEffect(() => () => resetMessages(), []);

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex space-x-4 h-[calc(100dvh_-_128px)] max-h-[calc(100dvh_-_128px)] overflow-hidden"
      >
        <Card className="w-[350px] flex-shrink-0 max-h-full p-6 space-y-4 flex flex-col overflow-hidden">
          <ScrollArea>
            <Accordion
              type="multiple"
              defaultValue={["item-1"]}
              className="w-full"
            >
              <AccordionItem
                value="item-1"
                className={clsx("border-none", "bg-secondary p-4 rounded-2xl")}
              >
                <AccordionTrigger>大型語言模型設定</AccordionTrigger>
                <AccordionContent>
                  <div className={clsx("flex flex-col space-y-4 mx-1")}>
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>語言模型</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="請選擇語言模型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getModelList.isPending && (
                                <SelectGroup>
                                  <SelectItem disabled value="pending">
                                    讀取中...
                                  </SelectItem>
                                </SelectGroup>
                              )}
                              {getModelList.isError && (
                                <SelectGroup>
                                  <SelectItem disabled value="error">
                                    讀取失敗
                                  </SelectItem>
                                </SelectGroup>
                              )}
                              {getModelList.isSuccess &&
                                Object.entries(getModelList.data?.models).map(
                                  ([key, value]) => (
                                    <SelectGroup>
                                      <SelectLabel>
                                        {key.toUpperCase()}
                                      </SelectLabel>
                                      {value
                                        .filter(
                                          (model) =>
                                            !/embedding|legacy|vision|question/.test(
                                              model.model.toLowerCase()
                                            ) &&
                                            !/vision/.test(
                                              model.version.toLowerCase()
                                            )
                                        )
                                        .map((model) => (
                                          <SelectItem
                                            key={
                                              model.model + model.deployment_id
                                            }
                                            value={`${key},${model.deployment_id}`}
                                          >
                                            {model.model + " " + model.version}
                                          </SelectItem>
                                        ))}
                                    </SelectGroup>
                                  )
                                )}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="systemPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>系統提示</FormLabel>
                            <div className="flex space-x-2">
                              <Popover
                                open={openPromptsPopover}
                                onOpenChange={setOpenPromptsPopover}
                              >
                                <PopoverTrigger asChild>
                                  <Button variant={"outline"} role="combobox">
                                    提示詞範本
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <Command>
                                    <CommandInput
                                      placeholder="搜尋提示詞"
                                      className="h-9"
                                    />
                                    <CommandEmpty>查無資料</CommandEmpty>
                                    <CommandList>
                                      {Array.isArray(getPrompts.data) &&
                                        getPrompts.data.map((prompt: any) => (
                                          <>
                                            <CommandItem
                                              key={prompt.name}
                                              value={prompt.name}
                                              onSelect={() => {
                                                form.setValue(
                                                  "systemPrompt",
                                                  prompt.sys_prompt
                                                );
                                                setOpenPromptsPopover(false);
                                              }}
                                              className="hover:bg-primary hover:text-primary-foreground"
                                            >
                                              {prompt.name}
                                            </CommandItem>
                                          </>
                                        ))}
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              {/* <Button
                                variant={"outline"}
                                onClick={() => setOpenSavePromptDialog(true)}
                              >
                                儲存提示
                              </Button>
                              <SavePromptDialog
                                systemPrompt={form.getValues("systemPrompt")}
                                open={openSavePromptDialog}
                                onSubmit={(value) => {
                                  console.log(value);
                                  setOpenSavePromptDialog(false);
                                }}
                                onClose={() => setOpenSavePromptDialog(false)}
                              /> */}
                            </div>
                          </div>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={8}
                              className="resize-none bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>溫度 {field.value}</FormLabel>
                          <Slider
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
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="stream">串流</Label>
                      <Switch
                        id="stream"
                        checked={isOpenAIStream}
                        onCheckedChange={(e) => setIsOpenAIStream(e)}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </Card>
        <Card className="w-full py-6 overflow-hidden">
          <div className="h-full max-h-full overflow-hidden flex flex-col">
            <div className="px-6 pb-6 text-right">
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={() => resetMessages()}
                disabled={
                  postLLMChat.isPending ||
                  // postSttFromFile.query.isPending ||
                  // postAOAIWhisper.isPending ||
                  isStreaming
                }
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                清除對話
              </Button>
            </div>
            <ScrollArea ref={scrollRef} className="max-h-full h-full mb-8">
              <div className="px-6 max-w-full overflow-x-auto">
                <ChatMessages messages={messages} />
              </div>
            </ScrollArea>
            <div className="px-6 pb-1 flex space-x-1 items-start">
              <FormField
                control={form.control}
                name="userPrompt"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={0}
                        className="resize-none"
                        onKeyDown={(e) => handleKeyDown(e)}
                        onCompositionStart={() =>
                          (isComposition.current = true)
                        }
                        onCompositionEnd={() => (isComposition.current = false)}
                        ref={userPromptInput}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={"ghost"}
                      className="rounded-full"
                      disabled={
                        postLLMChat.isPending ||
                        postSttFromFile.query.isPending ||
                        postAOAIWhisper.isPending ||
                        isStreaming
                      }
                      onClick={() => fileInputRef.current?.click()}
                      ref={uploadButtonRef}
                    >
                      <UploadIcon />
                      <input
                        type="file"
                        id="file"
                        accept="audio/wav"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>上傳聲音檔</TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={"ghost"}
                      className="rounded-full"
                      disabled={
                        postLLMChat.isPending ||
                        // postSttFromFile.query.isPending ||
                        // postAOAIWhisper.isPending ||
                        isStreaming
                      }
                      onClick={() => handleSubmit()}
                    >
                      <PaperPlaneIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-secondary text-secondary-foreground">
                    傳送
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>
      </form>
    </Form>
  );
};

export default ChatPlayground;
