import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

const AppMarkdown = (props: { children: string }) => {
  return (
    <MemoizedReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <SyntaxHighlighter
              {...rest}
              children={String(children).replace(/\n$/, "")}
              language={match[1]}
              style={atomDark}
              wrapLongLines
              wrapLines
            />
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
      className={"markdown"}
    >
      {props.children}
    </MemoizedReactMarkdown>
  );
};

export default AppMarkdown;
