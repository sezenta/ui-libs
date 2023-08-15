'use client';
import React, {FC, Suspense, useMemo} from 'react';
import 'react-quill/dist/quill.snow.css';
import './RichText.css';
import styled from 'styled-components';
import {GlobalToken, Input, theme} from 'antd';
const { useToken } = theme;
const ReactQuill = React.lazy(() => import('react-quill'));

// const ReactQuill =
//   typeof window === 'object' ? require('react-quill') : () => false;

export type RichTextInputProps = {
  onChange?: (value?: any) => void;
  value?: any;
  maxLength?: number;
  showCount?: boolean;
};

const useOmitFields = (value: any, ...fields: string[]) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(() => {
    const val = { ...value };
    fields.forEach((f) => delete val[f]);
    return val;
  }, [value, fields]);
};

const regex = /(<([^>]+)>)/gi;

export const RichTextWrapper = styled.div<{ $token: GlobalToken }>`
  .richText {
    display: flex;
    flex-direction: column;
    justify-content: right;
  }

  .richTextCount {
    width: 100%;
    text-align: right;
    padding: 4px;
    margin-bottom: -26px;
  }

  .ql-toolbar {
    transition: all 0.3s;
    border: 1px solid ${({ $token }) => $token.colorBorder};
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  .ql-container {
    min-height: 100px;
    transition: all 0.3s;
    font-family: ${({ $token }) => $token.fontFamily};
    font-size: ${({ $token }) => $token.fontSize}px;
    border: 1px solid ${({ $token }) => $token.colorBorder};
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .quill:hover {
    .ql-toolbar {
      border-color: ${({ $token }) => $token.colorPrimary};
      border-inline-end-width: 1px;
    }
    .ql-container {
      border-color: ${({ $token }) => $token.colorPrimary};
      border-inline-end-width: 1px;
    }
  }

  .quill:focus-within {
    .ql-toolbar {
      border-color: ${({ $token }) => $token.colorPrimary};
      border-right-width: 1px !important;
      outline: 0;
      box-shadow: 0 0 0 2px rgba(3, 73, 104, 0.2);
    }
    .ql-container {
      border-color: ${({ $token }) => $token.colorPrimary};
      border-right-width: 1px !important;
      outline: 0;
      box-shadow: 0 0 0 2px rgba(3, 73, 104, 0.2);
    }
  }

  .rich-text-char-count {
    display: flex;
    width: 100%;
    justify-content: right;
    margin-top: 8px;
  }
`;

export const RichTextInputInt: FC<RichTextInputProps> = (props) => {
  const formats = useMemo(
    () => [
      // 'header',
      'bold',
      'italic',
      'underline',
      // 'strike',
      'list',
      'bullet',
      'indent',
      'link',
      // 'color',
      // 'background',
    ],
    [],
  );
  const modules = useMemo(
    () => ({
      toolbar: [
        // [{ header: [3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline'],
        // [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['link'],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    [],
  );
  const p = useOmitFields(props, 'value', 'onChange');

  const checkCharacterCount = (event: {
    key: string;
    preventDefault: () => void;
  }) => {
    // const unprivilegedEditor = reactQuillRef.current.unprivilegedEditor;
    if (
      props.value?.length > (props.maxLength ?? 1000000) &&
      event.key !== 'Backspace'
    )
      event.preventDefault();
  };
  const { token } = useToken();
  if (typeof window === "undefined" ||
    window.document === undefined || window.document.createElement === undefined) {
    return <Input.TextArea/>
  }
  return (
    <RichTextWrapper $token={token}>
        <ReactQuill
          onKeyDown={checkCharacterCount}
          modules={modules}
          theme="snow"
          preserveWhitespace={true}
          value={props.value ? (props.value as string) : ''}
          onChange={(content: any) => props.onChange && props.onChange(content)}
          formats={formats}
          {...p}
        />
      {props.showCount && (
        <div className="rich-text-char-count">
          {props.maxLength
            ? `${
                props.maxLength - (props.value?.replace(regex, '').length ?? 0)
              }`
            : `${props.value?.replace(regex, '').length ?? 0}`}
        </div>
      )}
    </RichTextWrapper>
  );
};

export const RichTextInput: FC<RichTextInputProps> = (props) => <Suspense><RichTextInputInt {...props}/></Suspense>
