import React, { FC } from 'react';
import { DatePicker, Grid } from 'antd';

const { useBreakpoint } = Grid;

export const DatePickerInput: FC<any> = (props) => {
  const bp = useBreakpoint();

  return <>{bp.lg ? <DatePicker {...props} /> : <DatePicker {...props} inputReadOnly={true} />}</>;
};
