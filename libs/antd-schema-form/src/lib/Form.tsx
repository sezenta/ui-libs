'use client'
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Col, Divider, Form as AntdForm, Popconfirm, Row } from 'antd';
import { ColProps } from 'antd/lib/col';
import { CloseCircleFilled, PlusSquareOutlined } from '@ant-design/icons';
import { FormInstance, FormProps } from 'antd/lib/form';
import { SchemaFormConfigContext } from './SchemaFormConfig';

export interface FormColumn {
  layout: ColProps;
  fields: FormField[];
  // numlist: boolean;
}

export interface FormField {
  id: string;
  name?: React.ReactNode;
  tips?: string;
  type:
    | 'string'
    | 'number'
    | 'label'
    | 'password'
    | 'email'
    | 'text'
    | 'date'
    | 'radio'
    | 'checkBox'
    | 'boolean'
    | 'select'
    | 'dateRange'
    | 'file'
    | 'image'
    | 'phone'
    | 'switch'
    | string
    | { array: FormField; addText?: string; fixed?: boolean; max?: number }
    | { object: FormSchema };
  props?: any;
  options?: any | ((value: any, form: FormInstance, parentPath: NamePathArr) => any);
  visible?: ((value: any, form: FormInstance, parentPath: NamePathArr) => boolean) | boolean;
  layout?: ColProps;
  view?: (value: any) => React.ReactNode;
  mode?: string;
  numlist?: boolean;
  numlistSticked?: boolean;
  closeOnBlur?: boolean;
  closeOnChange?: boolean;
  confirmation?: string;
  star?: boolean;
}

export type NamePathArr = (string | number)[];
export type NamePath = string | number | NamePathArr;

type FormXContextData = {
  value?: any;
  form: FormInstance;
};

const FormXContext = React.createContext<FormXContextData>({ form: undefined as any });

export interface FormFieldsProps {
  schema: FormSchema;
  layout?: 'horizontal' | 'vertical';
  adapters?: TypeAdapter[];
  validationAdapters?: ValidationAdapter[];
  className?: string;
  fieldData?: any;
  parentPath?: NamePathArr;
}

export type TypeAdapter = React.ElementType;

export interface ValidationAdapter {
  name: string;
  validator: any;
  message?: string;
}

export type FormSchema = FormField | FormField[] | FormColumn | FormColumn[];
type SchemaFormItemProps = {
  field: FormField;
  adapters: { [key: string]: TypeAdapter };
  validationAdapters: { [key: string]: ValidationAdapter };
  fieldData?: any;
  _adapters?: TypeAdapter[];
  _validationAdapters?: ValidationAdapter[];
  parentPath: NamePathArr;
};

const SchemaFormItem = (props: SchemaFormItemProps) => {
  const { field, adapters } = props;
  const form = useContext(FormXContext);
  const fType = useMemo(() => {
    const fType = field.type;
    if (typeof fType === 'string') {
      return fType;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (fType.hasOwnProperty('object')) {
      return 'object';
    }
    return 'array';
  }, [field.type]);
  const namePath: NamePath = useMemo(() => {
    const fName = props.fieldData?.name;
    if (fName === undefined) {
      return [field.id];
    }
    if (Array.isArray(fName)) {
      return [...(fName as any), field.id];
    }
    if (typeof fName === 'number') {
      return [fName];
    }
    return [fName as any, field.id];
  }, [field.id, props]);

  const options = useMemo(() => {
    if (
      !field.options?.rules ||
      field.options!.rules.findIndex(
        (v: any) => v.hasOwnProperty('validator') && typeof v.validator === 'string',
      ) === -1
    ) {
      return field.options;
    }
    const options = { ...field.options };
    if (options.dependencies) {
      options.dependencies = options.dependencies.map((d: any) =>
        typeof d === 'string' ? [...props.parentPath, d] : d,
      );
    }
    options.rules = options.rules.map((rule: any) => {
      if (!rule.hasOwnProperty('validator') || typeof rule.validator !== 'string') {
        return rule;
      }

      const adapter = props.validationAdapters[rule.validator];
      if (adapter === undefined) {
        return rule;
      }
      const message = rule.message ? rule.message : adapter.message;
      return (form: FormInstance) => ({
        ...rule,
        message,
        validator: async (rule: any, value: any) =>
          adapter.validator(rule, value, form, props.parentPath, field),
      });
    });
    return options;
  }, [field, props.parentPath, props.validationAdapters]);
  // const options = useMemo(() => {
  //   if (
  //     !field.options?.rules ||
  //     field.options.rules.findIndex(
  //       // eslint-disable-next-line no-prototype-builtins
  //       (v: any) => v.hasOwnProperty('validator') && typeof v.validator === 'string',
  //     ) === -1
  //   ) {
  //     return field.options;
  //   }
  //   const options = { ...field.options };
  //   options.rules = options.rules.map((rule: any) => {
  //     // eslint-disable-next-line no-prototype-builtins
  //     if (!rule.hasOwnProperty('validator') || typeof rule.validator !== 'string') {
  //       return rule;
  //     }
  //
  //     const adapter = props.validationAdapters[rule.validator];
  //     if (adapter === undefined) {
  //       return rule;
  //     }
  //     const message = rule.message ? rule.message : adapter.message;
  //     return (form: FormInstance) => ({
  //       ...rule,
  //       message,
  //       validator: async (rule: any, value: any) => adapter.validator(rule, value, form),
  //     });
  //   });
  //   return options;
  // }, [field.options, props.validationAdapters]);

  const addText = useMemo(() => {
    if (fType === 'array' && (field.type as any).addText) {
      return (field.type as any).addText;
    }
    return 'Add';
  }, [fType, field.type]);

  const fixed = useMemo(() => {
    return fType === 'array' && (field.type as any).fixed === true;
  }, [fType, field.type]);

  const adapter = useMemo(
    () => (adapters[fType] ? adapters[fType] : adapters['string']),
    [adapters, fType],
  );

  if (fType === 'array') {
    return (
      <AntdForm.Item label={field.name} {...options} name={namePath}>
        <AntdForm.List name={namePath}>
          {(fields, operation) => (
            <>
              {fields.map((f, i) => (
                <div key={i}>
                  <div
                    className={'schema-form-item'}
                    style={{ display: 'flex', position: 'relative' }}
                    key={i}>
                    {field.numlist && (
                      <div>
                        <p>{i > 8 ? i + 1 : `0${i + 1}`}</p>
                      </div>
                    )}
                    {i !== 0 && (
                      <Divider style={{ position: 'absolute', left: 0, right: 0, top: -30 }} />
                    )}
                    <div style={{ flexGrow: 1 }}>
                      <SchemaFormItems
                        schema={[(field.type as any).array as FormField]}
                        fieldData={f}
                        adapters={props._adapters}
                        validationAdapters={props._validationAdapters}
                        parentPath={[...props.parentPath, props.field.id, i]}
                      />
                    </div>
                    {!fixed && (
                      <div>
                        {/*<CloseCircleFilled onClick={() => operation.remove(i)} />*/}
                        <Popconfirm
                          placement="top"
                          title={field.confirmation ?? 'Are you sure you want to delete?'}
                          onConfirm={() => operation.remove(i)}
                          okText="Yes"
                          okButtonProps={{ danger: true }}
                          cancelText="No">
                          <CloseCircleFilled />
                        </Popconfirm>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!fixed && ((field.type as any).max ?? 100) > fields.length && (
                <Button
                  // type={'dashed'}
                  style={{ display: 'block', width: '100%', textAlign: 'left', color: '#009E52' }}
                  onClick={() => operation.add(field.props?.defaultValue)}>
                  {/* <PlusOutlined /> */}
                  <PlusSquareOutlined />
                  {addText}
                </Button>
              )}
            </>
          )}
        </AntdForm.List>
      </AntdForm.Item>
    );
  }
  if (fType === 'object') {
    return (
      <SchemaFormItems
        schema={(field.type as any).object as FormSchema}
        fieldData={{ name: namePath }}
        parentPath={[...props.parentPath]}
      />
    );
  }
  const COMP = adapter;
  const prps = {
    ...(typeof field.props === 'function'
      ? field.props(form.value ? form.value : {}, form.form, props.parentPath)
      : field.props),
  };
  return (
    <AntdForm.Item {...options} label={field.name} name={namePath}>
      <COMP {...prps} />
    </AntdForm.Item>
  );
};

type SchemaFormFieldItemType = FormField | FormField[];
type SchemaFormItemGroupProps = {
  field: SchemaFormFieldItemType;
  adapters: { [key: string]: TypeAdapter };
  validationAdapters: { [key: string]: ValidationAdapter };
  fieldData?: any;
  _adapters?: TypeAdapter[];
  _validationAdapters?: ValidationAdapter[];
  parentPath: NamePathArr;
};
const SchemaFormItemGroup = (props: SchemaFormItemGroupProps) => {
  const { field, adapters } = props;
  if (Array.isArray(field)) {
    return (
      <Row gutter={16} style={{ flexGrow: 1 }}>
        {field.map((f, index) => (
          <Col span={24} {...f.layout} key={index}>
            <SchemaFormItem
              field={f}
              adapters={adapters}
              fieldData={props.fieldData}
              validationAdapters={props.validationAdapters}
              _adapters={props._adapters}
              _validationAdapters={props._validationAdapters}
              parentPath={props.parentPath}
            />
          </Col>
        ))}
      </Row>
    );
  }
  return (
    <SchemaFormItem
      field={field as FormField}
      adapters={adapters}
      fieldData={props.fieldData}
      validationAdapters={props.validationAdapters}
      _adapters={props._adapters}
      _validationAdapters={props._validationAdapters}
      parentPath={props.parentPath}
    />
  );
};

type SchemaFormFieldsProps = {
  schema: FormField[];
  adapters: { [key: string]: TypeAdapter };
  validationAdapters: { [key: string]: ValidationAdapter };
  fieldData?: any;
  _adapters?: TypeAdapter[];
  _validationAdapters?: ValidationAdapter[];
  parentPath: NamePathArr;
};

const SchemaFormFields: FC<SchemaFormFieldsProps> = (props) => {
  const { schema, adapters, validationAdapters } = props;
  const form = useContext(FormXContext);
  const fields = useMemo(() => {
    const f: SchemaFormFieldItemType[] = [];
    let group: FormField[] = [];
    for (const field of schema) {
      if (field.visible !== undefined) {
        if (typeof field.visible === 'boolean' && !field.visible) {
          continue;
        }
        if (
          typeof field.visible === 'function' &&
          !field.visible(form.value ? form.value : {}, form.form, props.parentPath)
        ) {
          continue;
        }
      }
      if (field.layout) {
        group.push(field);
      } else {
        if (group.length > 0) {
          f.push(group);
          group = [];
        }
        f.push(field);
      }
    }
    if (group.length > 0) {
      f.push(group);
    }
    return f;
  }, [form.form, form.value, props.parentPath, schema]);

  return (
    <>
      {fields.map((field, index) => (
        <SchemaFormItemGroup
          field={field}
          adapters={adapters}
          key={index}
          fieldData={props.fieldData}
          validationAdapters={validationAdapters}
          _adapters={props._adapters}
          _validationAdapters={props._validationAdapters}
          parentPath={props.parentPath}
        />
      ))}
    </>
  );
};

export const SchemaFormItems: FC<FormFieldsProps> = (props) => {
  const { schema } = props;
  const configCtx = useContext(SchemaFormConfigContext);
  const adapters = configCtx.adapters;

  const validationAdapters: { [key: string]: ValidationAdapter } = useMemo(() => {
    const ads: { [key: string]: ValidationAdapter } = {};
    configCtx.validators.forEach((value) => (ads[value.name] = value));
    if (props.validationAdapters) {
      props.validationAdapters.forEach((value) => (ads[value.name] = value));
    }
    return ads;
  }, [configCtx.validators, props.validationAdapters]);
  const [sch, typ] = useMemo(() => {
    const sx = Array.isArray(schema) ? schema : [schema];
    const ty = sx.length > 0 && sx[0].hasOwnProperty('fields') ? 'columns' : 'fields';
    return [sx, ty];
  }, [schema]);
  if (sch.length === 0) {
    return <></>;
  }

  if (typ === 'fields') {
    return (
      <SchemaFormFields
        schema={sch as FormField[]}
        adapters={adapters}
        validationAdapters={validationAdapters}
        fieldData={props.fieldData}
        _adapters={props.adapters}
        _validationAdapters={props.validationAdapters}
        parentPath={props.parentPath ? props.parentPath : []}
      />
    );
  }

  return (
    <Row gutter={16}>
      {(sch as FormColumn[]).map((value, index) => (
        <Col {...value.layout} key={index}>
          <SchemaFormFields
            schema={value.fields}
            adapters={adapters}
            validationAdapters={validationAdapters}
            fieldData={props.fieldData}
            parentPath={props.parentPath ? props.parentPath : []}
          />
        </Col>
      ))}
    </Row>
  );
};

export const InternalForm: FC<PropsWithChildren<FormProps> & { valueChangeNotif?: boolean }> = (props) => {
  const [value, setValue] = useState<any>();
  const notifRef = useRef<boolean>(false);
  const onValuesChange = useCallback(
    (changed: any, all: any) => {
      setValue(all);
      props.onValuesChange?.(changed, all);
    },
    [props],
  );

  useEffect(() => {
    if (props.valueChangeNotif === notifRef.current) {
      return;
    }
    notifRef.current = props.valueChangeNotif ?? false;
    const values = props.form?.getFieldsValue();
    setValue(values);
  }, [onValuesChange, props.form, props.valueChangeNotif]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    <FormXContext.Provider value={{ value, form: props.form! }}>
      <AntdForm
        className="antd-schema-form"
        scrollToFirstError={{ behavior: 'smooth', scrollMode: 'always' }}
        {...props}
        onValuesChange={onValuesChange}>
        {props.children}
      </AntdForm>
    </FormXContext.Provider>
  );
};

export const setValidationErrors = (form: FormInstance, error: any): boolean => {

  if (error?.body?.validationErrors) {
    form.setFields(
      Object.entries(error.body.validationErrors).map((e) => ({
        name: e[0].split('.'),
        errors: [e[1]] as string[],
      })),
    );
    return true;
  }
  return false;
};

