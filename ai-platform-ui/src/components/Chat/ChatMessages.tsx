import { Message } from "@/features/chat";
import { RoleEnum } from "@/types/chat";
import { Bot, User } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import AppMarkdown from "../App/AppMarkdown";

const BotMessage = (props: { message: string }) => {
  return (
    <div className="flex space-x-4">
      <div className="p-2 rounded-full bg-secondary self-start">
        <Bot />
      </div>
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <ErrorBoundary fallback={<div>{props.message}</div>}>
          <AppMarkdown>{props.message}</AppMarkdown>
        </ErrorBoundary>
      </div>
    </div>
  );
};

const HumanMessage = (props: { message: string }) => {
  return (
    <div className="flex flex-row-reverse">
      <div className="p-2 rounded-full bg-secondary ml-4 self-start">
        <User />
      </div>
      <div className="bg-secondary text-secondary-foreground p-2 rounded-lg">
        <ErrorBoundary fallback={<div>{props.message}</div>}>
          <AppMarkdown>{props.message}</AppMarkdown>
        </ErrorBoundary>
      </div>
    </div>
  );
};

const ChatMessages = (props: { messages: Message[] }) => {
  return (
    <>
      {props.messages.map((message, index) => (
        <div key={index} className="mb-8">
          {message.role === RoleEnum.ai ? (
            <BotMessage message={message.message} />
          ) : (
            <HumanMessage message={message.message} />
          )}
        </div>
      ))}
    </>
  );
};

export default ChatMessages;
