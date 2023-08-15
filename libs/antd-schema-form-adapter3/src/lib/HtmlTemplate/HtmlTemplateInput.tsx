'use client';
import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import EmailEditor from 'react-email-editor';
import { Button, GlobalToken, Input, Modal, theme } from 'antd';
import { HtmlView } from './HtmlView';
import styled from 'styled-components';
const { useToken } = theme;

const TemplateEditorDiv = styled.div<{ $token: GlobalToken }>`
  .templateEditor {
    position: relative;
    min-height: 100px;
    height: auto;
  }
  .templateEditorOverlay {
    /*background-color: red;*/
    position: absolute !important;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    min-height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .templateEditorOverlay:not(:hover) {
    border-color: ${({ $token }) => $token.colorBorder} !important;
  }
  .emailEditor {
    width: 100%;
    min-height: calc(100vh - 300px);
  }

  .templateEditorDisplay {
    position: relative;
    width: 100%;
  }

  .template-click-here {
    background-color: white;
    color: ${({ $token }) => $token.colorText};
    border: 1px solid ${({ $token }) => $token.colorBorder};
    padding: 8px 16px;
    width: min-content;
  }
`;

const EmailEditorX: any = EmailEditor;

export type HtmlTemplate = {
  html: string;
  design: string;
  mergeTags?: string;
};
export type HtmlTemplateInputProps = {
  value?: HtmlTemplate;
  onChange?: (value?: HtmlTemplate) => void;
  editorProps?: any;
  mergeTags?: boolean;
};
export const HtmlTemplateInput: FC<HtmlTemplateInputProps> = ({
  editorProps,
  value,
  onChange,
  mergeTags,
}) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const designer = useRef<any>(null);
  const editorLoaded = useRef<boolean>();
  const onSave = useCallback(() => {
    if (
      designer.current !== undefined &&
      designer.current !== null &&
      editorLoaded.current &&
      onChange
    ) {
      setSaving(true);
      designer.current.exportHtml((data: any) => {
        onChange({
          design: JSON.stringify(data.design),
          html: data.html,
          mergeTags: value?.mergeTags,
        });
        setSaving(false);
        setEditing(false);
      });
    }
  }, [onChange, value?.mergeTags]);
  const onEditorLoad = useCallback(() => {
    if (
      designer.current !== undefined &&
      designer.current !== null &&
      editorLoaded.current &&
      value
    ) {
      designer.current?.loadDesign?.(JSON.parse(value.design));
    }
  }, [value]);

  const mtgs = useMemo(() => {
    try {
      return mergeTags
        ? value?.mergeTags
          ? JSON.parse(value?.mergeTags)
          : undefined
        : editorProps?.options?.mergeTags;
    } catch (e) {
      return undefined;
    }
  }, [editorProps?.options?.mergeTags, mergeTags, value?.mergeTags]);
  const { token } = useToken();
  return (
    <TemplateEditorDiv $token={token}>
      {mergeTags && (
        <Input.TextArea
          placeholder="Merge Tags. (Enter merge tags as a valid JSON)"
          value={value?.mergeTags}
          onChange={(e) =>
            onChange?.({
              ...(value ?? { design: '', html: '' }),
              mergeTags: e.target.value,
            })
          }
        />
      )}
      <div className="templateEditorDisplay">
        {value && <HtmlView value={value.html} />}
        <Button
          className="templateEditorOverlay"
          ghost={true}
          onClick={() => setEditing(true)}
        >
          <div className="template-click-here">
            {'Click here to edit template'}
          </div>
        </Button>
      </div>
      <Modal
        style={{ top: 16 }}
        title={'Template'}
        open={editing}
        onOk={onSave}
        onCancel={() => setEditing(false)}
        okText="Save"
        confirmLoading={saving}
        cancelText="Cancel"
        destroyOnClose={true}
        width={'100%'}
        // maskClosable={this.props.maskClosable}
        closable={true}
      >
        <EmailEditorX
          style={{ width: '100%', minHeight: 'calc(100vh - 176px)' }}
          ref={(instance: any) => {
            (designer as any).current = instance;
            onEditorLoad();
          }}
          projectId={3657}
          onLoad={() => {
            editorLoaded.current = true;
            onEditorLoad();
          }}
          {...editorProps}
          options={{
            ...editorProps?.options,
            mergeTags: mtgs,
          }}
        />
      </Modal>
    </TemplateEditorDiv>
  );
};
