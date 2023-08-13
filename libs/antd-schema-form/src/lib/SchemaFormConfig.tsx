import { TypeAdapter, ValidationAdapter } from './Form';
import React, { FC, PropsWithChildren, useContext, useMemo } from 'react';
import CommonAdapters from './CommonAdapters';

type SchemaFormConfigData = {
  adapters: Record<string, TypeAdapter>;
  validators: ValidationAdapter[];
};

export const SchemaFormConfigContext = React.createContext<SchemaFormConfigData>({
  adapters: CommonAdapters.typeAdapters,
  validators: CommonAdapters.allValidators,
});

export type SchemaFormConfigProviderProps = {
  adapters?: Record<string, TypeAdapter>;
  validators?: ValidationAdapter[];
};

export const SchemaFormConfigProvider: FC<PropsWithChildren<SchemaFormConfigProviderProps>> = (
  props,
) => {
  const parentContext = useContext(SchemaFormConfigContext);
  const { adapters: parentAdapters, validators: parentValidators } = parentContext;
  const { adapters: propsAdapters, validators: propsValidators } = props;
  const adapters = useMemo(
    () => ({ ...(propsAdapters ?? {}), ...parentAdapters }),
    [parentAdapters, propsAdapters],
  );
  const validators = useMemo(
    () => [...(propsValidators ?? []), ...parentValidators],
    [parentValidators, propsValidators],
  );
  return (
    <SchemaFormConfigContext.Provider value={{ adapters, validators }}>
      {props.children}
    </SchemaFormConfigContext.Provider>
  );
};
