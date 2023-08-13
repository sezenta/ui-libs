import React, {FC, PropsWithChildren} from 'react';
import styled from "styled-components";
import {GlobalToken, theme} from "antd";
const { useToken } = theme;

const AdapterProviderStyle = styled.div<{ token: GlobalToken }>`
  .ant-form-item-has-error .PhoneInputInput {
    border-color: red !important;
  }

  .ant-form-item-has-error .PhoneInputInput:focus {
    border-color: red !important;
    box-shadow: 0 0 0 2px rgba(255, 38, 5, 0.06) !important;
  }

  .ant-form-item-has-error .ql-toolbar {
    border-color: red !important;
  }
  .ant-form-item-has-error .ql-container {
    border-color: red !important;
  }

  .ant-form-item-has-error .quill:focus-within .ql-toolbar {
    border-color: red !important;
    box-shadow: 0 0 0 2px rgba(255, 38, 5, 0.06) !important;
  }
  .ant-form-item-has-error .quill:focus-within .ql-container {
    border-color: red !important;
    box-shadow: 0 0 0 2px rgba(255, 38, 5, 0.06) !important;
  }


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
  }

  .emailEditor {
    width: 100%;
    min-height: calc(100vh - 300px);
  }

  .templateEditorDisplay {
    position: relative;
    width: 100%;
  }

`
export const AntdSchemaFormAdapterProvider: FC<PropsWithChildren> = (props) => {
  const { token, theme } = useToken();
  return (
    <AdapterProviderStyle token={token}>
      {props.children}
    </AdapterProviderStyle>
  );
};
