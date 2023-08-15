import {MapProps} from "@sezenta/antd-schema-form";
import {PhoneInput} from "./phone/PhoneInput";
import {RichTextInput} from "./RichText/RichTextInput";
import {HtmlTemplateInput} from "./HtmlTemplate/HtmlTemplateInput";
import styled from "styled-components";

export const AntdSchemaFormAdapters = {
  phone: MapProps(PhoneInput as any, {
    encode: (value: string) => (value === '' ? undefined : value),
    decode: (value) => value ?? '',
    className: '',
  }),
  richText: MapProps(RichTextInput, {
    encode: (value?: string) => {
      if (value && value.replace(/<[^>]+>/g, '').trim() === '') {
        return undefined;
      }
      return value;
    },
  }),
  template: HtmlTemplateInput,
}
