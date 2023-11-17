import {TypeAdapter, ValidationAdapter} from './Form';
import React, {FC, PropsWithChildren, useContext, useMemo} from 'react';
import CommonAdapters from './CommonAdapters';

type SchemaFormConfigData = {
  adapters: Record<string, TypeAdapter>;
  validators: ValidationAdapter[];
  wrappers: Record<string, React.ElementType>;
  arrayAdd?: React.ElementType;
  arrayRemove?: React.ElementType;
};

export const SchemaFormConfigContext =
  React.createContext<SchemaFormConfigData>({
    adapters: CommonAdapters.typeAdapters,
    validators: CommonAdapters.allValidators,
    wrappers: {},
  });

export type SchemaFormConfigProviderProps = {
  adapters?: Record<string, TypeAdapter>;
  validators?: ValidationAdapter[];
  wrappers?: Record<string, React.ElementType>;
  arrayAdd?: React.ElementType;
  arrayRemove?: React.ElementType;
};

export const SchemaFormConfigProvider: FC<
  PropsWithChildren<SchemaFormConfigProviderProps>
> = props => {
  const parentContext = useContext(SchemaFormConfigContext);
  const {
    adapters: parentAdapters,
    validators: parentValidators,
    wrappers: parentWrappers,
  } = parentContext;
  const {
    adapters: propsAdapters,
    validators: propsValidators,
    wrappers: propsWrappers,
  } = props;
  const adapters = useMemo(
    () => ({...parentAdapters, ...(propsAdapters ?? {})}),
    [parentAdapters, propsAdapters],
  );
  const validators = useMemo(
    () => [...parentValidators, ...(propsValidators ?? [])],
    [parentValidators, propsValidators],
  );
  const wrappers = useMemo(
    () => ({...parentWrappers, ...(propsWrappers ?? {})}),
    [parentWrappers, propsWrappers],
  );
  return (
    <SchemaFormConfigContext.Provider
      value={{
        adapters,
        validators,
        wrappers,
        arrayAdd: props.arrayAdd,
        arrayRemove: props.arrayRemove,
      }}>
      {props.children}
    </SchemaFormConfigContext.Provider>
  );
};
