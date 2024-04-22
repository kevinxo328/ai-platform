export enum MessageTypeEnum {
  text = "text",
  loading = "loading",
  error = "error",
}

export enum RoleEnum {
  human = "human",
  ai = "ai",
}

export type Message = {
  role: RoleEnum | keyof typeof RoleEnum;
  message: string;
  messageType: MessageTypeEnum | keyof typeof MessageTypeEnum;
};
