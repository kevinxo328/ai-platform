import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { Button } from "../shadcn/ui/button";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../shadcn/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "../shadcn/ui/textarea";
import { useEffect } from "react";
import { Popover, PopoverTrigger } from "../shadcn/ui/popover";

type Props = {
  open: boolean;
  systemPrompt?: string;
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  onClose?: () => void;
};

/*
 write a form schema for the dialog
 name: '提示詞名稱'
 systemPrompt: '系統提示'
 tags: ['標籤']
*/
const formSchema = z.object({
  name: z.string().min(1, "提示詞名稱不能為空"),
  systemPrompt: z.string().min(1, "系統提示不能為空"),
  tags: z.array(z.string()),
});

const SavePromptDialog = (props: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt: props.systemPrompt || "",
      name: "",
      tags: [],
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    props.onSubmit && props.onSubmit(values);
  };

  useEffect(() => {
    if (props.open) {
      form.reset({
        systemPrompt: props.systemPrompt || "",
        name: "",
        tags: [],
      });
    }
  }, [props.open]);

  return (
    <Dialog
      open={props.open}
      onOpenChange={(e) => {
        if (!e) {
          props.onClose && props.onClose();
        }
      }}
    >
      <DialogContent onInteractOutside={() => props.onClose && props.onClose()}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-foreground">儲存提示</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>提示詞名稱</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>提示詞內容</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={5} className="resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="tags"
                render={() => (
                  <FormItem>
                    <FormLabel>標籤</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            role="combobox"
                            className={"w-full"}
                          ></Button>
                        </FormControl>
                      </PopoverTrigger>
                    </Popover>
                  </FormItem>
                )}
              /> */}
            </div>
            <DialogFooter>
              <Button
                variant={"outline"}
                onClick={() => props.onClose && props.onClose()}
              >
                取消
              </Button>
              <Button type="submit">儲存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SavePromptDialog;
