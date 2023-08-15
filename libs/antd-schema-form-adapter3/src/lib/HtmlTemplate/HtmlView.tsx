'use client';
import React, { FC } from 'react';
import ReactHtmlParser from 'react-html-parser';

type Props = {
  value?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const HtmlView: FC<Props> = (props) => {
  return (
    <div {...props}>{props.value && (ReactHtmlParser(props.value) as any)}</div>
  );
};
