'use client';
import ReactPhoneInput, {
  DefaultInputComponentProps,
} from 'react-phone-number-input';
import { FC } from 'react';
import { GlobalToken, theme } from 'antd';
import styled from 'styled-components';
import 'react-phone-number-input/style.css';
import './PhoneInput.css';
const { useToken } = theme;

const PhoneInputWrapper = styled.div<{ token: GlobalToken }>`
  position: relative;
  .PhoneInput {
    height: ${({ token }) =>
      (token.Input as any)?.controlHeight ?? token.controlHeight}px;
    width: 100%;

    .PhoneInputInput {
      box-sizing: border-box;
      margin: 0;
      height: ${({ token }) =>
        (token.Input as any)?.controlHeight ?? token.controlHeight}px;
      font-variant: tabular-nums;
      list-style: none;
      font-feature-settings: 'tnum', 'tnum';
      position: relative;
      display: inline-block;
      width: 100%;
      min-width: 0;
      padding: 4px 11px 4px 60px;
      color: ${({ token }) => token.colorText};
      font-size: ${({ token }) => token.fontSize}px;
      line-height: 1.5715;
      background-color: #fff;
      background-image: none;
      border: 1px solid ${({ token }) => token.colorBorder};
      border-radius: ${({ token }) => token.borderRadius}px;
      transition: all 0.3s;
      margin-left: -43px;
    }

    .PhoneInputInput:focus {
      border-color: ${({ token }) => token.colorPrimary};
      border-right-width: 1px !important;
      outline: 0;
      box-shadow: 0 0 0 2px rgba(3, 73, 104, 0.2);
    }

    .PhoneInputCountrySelect {
      z-index: 2;
      width: 60px;
    }

    .PhoneInputCountryIcon {
      width: 28px;
      height: 20px;
      z-index: 1;
      transform: translateX(18px);
    }

    .PhoneInputCountryIcon--border {
      border: none;
    }
  }
`;

export type PhoneInputProps = Omit<DefaultInputComponentProps, 'value'> & {
  onChange: (value?: string) => void;
  value?: string;
}
export const PhoneInput: FC<PhoneInputProps> = (props) => {
  const { token } = useToken();

  return (
    <PhoneInputWrapper token={token}>
      <ReactPhoneInput {...props} value={props.value ?? ''} />
    </PhoneInputWrapper>
  );
};
