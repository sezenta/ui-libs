// import { Icon as LegacyIcon } from '@ant-design/compatible';

import React, {CSSProperties, useMemo} from 'react';
import {NamePathArr, TypeAdapter, ValidationAdapter} from './Form';
import {FormInstance} from 'rc-field-form';

export type MapPropsOptions = {
  map?: (props: any) => any;
  put?: Record<string, any>;
  remove?: string | string[];
  style?: CSSProperties;
  className?: string;
  encode?: (value: any) => any;
  decode?: (value: any) => any;
};

export const MapProps = (
  component: React.ComponentType,
  mapper: MapPropsOptions,
): React.ComponentType => {
  const Com = component;

  return (p: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const newProps = useMemo(() => {
      const prps: any = mapper.put ? {...mapper.put, ...p} : {...p};
      if (mapper.remove) {
        if (Array.isArray(mapper.remove)) {
          mapper.remove.forEach(m => delete prps[m]);
        } else {
          delete prps[mapper.remove];
        }
      }
      if (mapper.style) {
        prps.style = prps.style
          ? {...mapper.style, ...prps.style}
          : mapper.style;
      }
      if (mapper.className) {
        prps.className = `${mapper.className} ${prps.className ?? ''}`.trim();
      }
      if (mapper.encode) {
        const onChange = prps.onChange;
        if (onChange) {
          prps.onChange = (value: any) => {
            if (value === undefined || value === null) {
              onChange(undefined);
            } else if (value.target !== undefined && value.target !== null) {
              onChange(
                value.target.value === undefined || value.target.value === null
                  ? undefined
                  : mapper.encode?.(value.target.value),
              );
            } else {
              onChange(mapper.encode?.(value));
            }
          };
        }
      }
      if (mapper.decode) {
        const value = prps.value;
        if (value !== undefined) {
          prps.value = mapper.decode(value);
        }
      }
      return mapper.map ? mapper.map(prps) : prps;
    }, [p]);
    return <Com {...newProps} />;
  };
};

export default class CommonAdapters {
  static typeAdapters: Record<string, TypeAdapter> = {
    // string: {
    //   component: Input,
    //   trigger: 'onChangeText',
    //   validateTrigger: ['onChangeText', 'onBlur'],
    // },
    // password: {
    //   component: MapProps(Input, {put: {secureTextEntry: true}}),
    //   trigger: 'onChangeText',
    //   validateTrigger: ['onChangeText', 'onBlur'],
    // },
  };

  static allValidators: ValidationAdapter[] = [
    {
      name: 'invalid-answers',
      message: 'Invalid Unacceptable Responses.',
      validator: async (
        rule: any,
        value: any,
        form: FormInstance,
        path: NamePathArr,
        // field: FormField,
      ) => {
        const answers = form.getFieldValue([...path, 'answers']) ?? [];
        const blocked = value ?? [];
        for (const v of blocked) {
          if (answers.indexOf(v) === -1) {
            throw Error(`Answer "${v}" is not in all answer list.`);
          }
        }
      },
    },
    {
      name: 'equals',
      message: 'Should be equals',
      validator: async (rule: any, value: any, form: FormInstance) => {
        if (form.getFieldValue(rule.to) !== value) {
          throw Error('Not equal');
        }
      },
    },
    {
      name: 'depends',
      message: 'empty',
      validator: async (rule: any, value: any, form: FormInstance) => {
        // console.log('vvvvvvvv', value);
        // console.log('rulllll', rule.to);
        // console.log('rulllllvvvv', form.getFieldValue(rule.to));
        if (form.getFieldValue(rule.to) === undefined && value.value === '') {
          throw Error('empty');
        }
      },
    },
    {
      name: 'passwordPolicy',
      message: 'Should be equals',
      validator: async (rule: any, value: any) => {
        const strongRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*"'()+,-./:;<=>?[\\\]_`{|}~])(?=.{8,})/;
        if (
          value === undefined ||
          value.length === 0 ||
          strongRegex.test(value)
        ) {
          console.log('');
        } else {
          throw Error(
            'Password should contain more than 8 characters and at least 1 upper case character, ' +
              '1 lower case character, 1 number and 1 special character',
          );
        }
      },
    },
    // {
    //   name: 'phone',
    //   message: 'Should be valid phone number',
    //   validator: async (_: any, value: any) => {
    //     console.log('XXXXX', value);
    //     if (value === undefined || value === '') {
    //       console.log('XXXXXY', value);
    //       return;
    //     }
    //     if (!value || isValidPhoneNumber(value)) {
    //       console.log('XXXXXZ', value);
    //       return;
    //     } else {
    //       console.log('XXXXXE', value);
    //       throw Error('Invalid phone number');
    //     }
    //   },
    // },
    // {
    //   name: 'phoneVerification',
    //   message: 'Should be valid phone number',
    //   validator: async (_: any, value: any) => {
    //     if (value === undefined || value.phone === '') {
    //       return;
    //     }
    //     if (!value.phone || isValidPhoneNumber(value.phone)) {
    //       return;
    //     } else {
    //       throw Error('Invalid phone number');
    //     }
    //   },
    // },
    // {
    //   name: 'whatsappVerification',
    //   message: 'Should be valid phone number',
    //   validator: async (_: any, value: any) => {
    //     if (value === undefined || value.whatsapp === '') {
    //       return;
    //     }
    //     if (!value.whatsapp || isValidPhoneNumber(value.whatsapp)) {
    //       return;
    //     } else {
    //       throw Error('Invalid phone number');
    //     }
    //   },
    // },
    {
      name: 'array-item-equals',
      message: 'Duplicate value',
      validator: async (
        rule: any,
        value: any,
        form: FormInstance,
        path: NamePathArr,
      ) => {
        let val = form.getFieldsValue();
        for (let i = 0; i < path.length - 1; i += 1) {
          val = val?.[path[i]];
        }
        if (val && Array.isArray(val)) {
          const index: number = path[path.length - 1] as number;
          for (let i = 0; i < val.length; i += 1) {
            if (i === index) {
              continue;
            }
            if (val[index].type === undefined) {
              return;
            }
            if (typeof rule.compare === 'function') {
              rule.compare?.(val[index], val[i]);
            } else if (
              typeof rule.compare === 'string' ||
              typeof rule.compare === 'number'
            ) {
              if (
                typeof val[index]?.[rule.compare] === 'string' &&
                typeof val[i]?.[rule.compare] === 'string'
              ) {
                if (
                  val[index]?.[rule.compare].toLowerCase() ===
                  val[i]?.[rule.compare].toLowerCase()
                ) {
                  throw Error(rule.message ?? 'Duplicate value');
                }
              } else if (
                val[index]?.[rule.compare] === val[i]?.[rule.compare]
              ) {
                throw Error(rule.message ?? 'Duplicate value');
              }
            } else if (Array.isArray(rule.compare)) {
              let eq = false;
              for (const f of rule.compare) {
                if (val[index]?.[f] === val[i]?.[f]) {
                  eq = true;
                } else {
                  eq = false;
                  break;
                }
              }
              if (eq) {
                throw Error(rule.message ?? 'Duplicate value');
              }
            }
          }
        }
      },
    },
    // {
    //   name: 'nic',
    //   message: 'Should be a valid NIC',
    //   validator: async (_: any, value: any) => {
    //     if (value === undefined || value === '') {
    //       return;
    //     }
    //     const pattern = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/m;
    //     if (!value.match(pattern)) {
    //       throw Error('Not a NIC');
    //     }
    //     try {
    //       const datePart = value.substr(value.length === 10 ? 2 : 4, 3);
    //       let date = parseInt(datePart);
    //       if (date > 500) {
    //         date = date - 500;
    //       }
    //       if (date <= 0 || date > 366) {
    //         throw Error('Not a NIC');
    //       }
    //     } catch (e) {
    //       throw Error('Not a NIC');
    //     }
    //   },
    // },
    {
      name: 'email',
      message: 'Should be valid E-mail',
      validator: async (_: any, value: any) => {
        if (value === undefined || value === '') {
          return;
        }
        const pattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,8}$/g;
        if (!value.match(pattern)) {
          throw Error('Not a Valid E-mail');
        }
      },
    },
    {
      name: 'plusNumber',
      message: 'Should be Positive value',
      validator: async (_: any, value: number) => {
        if (value === undefined || value === 0) {
          return;
        }
        if (+value < 0) {
          throw Error('Not a Positive Value');
        }
      },
    },

    {
      name: 'durationValidator',
      validator: async (
        rule: any,
        value: {
          from?: string;
          present?: boolean;
          to?: string;
        },
      ) => {
        if (!value) {
          return;
        }

        if (value.from === undefined) {
          throw new Error(`${rule.fromDate ?? 'From date'} is required`);
        }

        if (!value.present) {
          if (value.to === undefined) {
            throw new Error(`${rule.toDate ?? 'End date'} is required`);
          }
          if (value.to < value.from) {
            throw new Error(
              `${rule.fromDate ?? 'End date'} should be greater than ${
                rule.fromDate ?? 'From date'
              }`,
            );
          }
        }
      },
    },
    {
      name: 'endDateValidator',
      message: 'Should be a valid end date',
      validator: async (
        rule: any,
        value: {from: string; present: boolean; to: string},
      ) => {
        console.log({value});
        if (!value.to && value.present === undefined) {
          throw Error('Should be a valid end date');
        } else {
          return;
        }
      },
    },

    {
      name: 'salaryValidator',
      message: 'Should be Correct Salary Value',
      validator: async (_a: any, value: any) => {
        if (value.salary === undefined || value.salary === 0) {
          throw Error('Salary is required');
        } else {
          return;
        }
        // const vall = /^\d+$/.test(value.salary);
        // console.log({vall});
        // if (/^\d+$/.test(value.salary) != null) {
        //   return;
        //   console.log('vvvvvvvvv');
        //   const salary = parseInt(value.salary);
        //   if (salary < 0) {
        //     throw Error('Salary should not be Minus');
        //   } else {
        //     return;
        //   }
        // } else {
        //   throw Error('Salary Should be a Numaric value');
        // }
      },
    },
    {
      name: 'descriptionValidator',
      message: '',
      validator: async (_a: any, value: any) => {
        if (!value) {
          return;
        }
        const text = value.replace(/<[^>]+>/g, '');
        if (text === '') {
          throw Error('Description is required');
        } else {
          return;
        }
      },
    },

    {
      name: 'salaryEmpty',
      message: 'Salary is Required',
      validator: async (_a: any, value: any) => {
        if (value.salary === undefined) {
          throw Error('Salary is Required');
        }
      },
    },
    {
      name: 'urlValidator',
      message: 'Please enter a valid website link',
      validator: async (_a: any, value: string) => {
        if (value === null || value === '' || value === undefined) {
          return;
        }
        const pattern = new RegExp(
          '^(https?:\\/\\/)?' +
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
            '((\\d{1,3}\\.){3}\\d{1,3}))' + //
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
            '(\\?[;&a-z\\d%_.~+=-]*)?' +
            '(\\#[-a-z\\d_]*)?$',
          'i',
        );

        if (!value.match(pattern)) {
          throw Error('Please enter a valid website link');
        } else {
          return;
        }
      },
    },
    {
      name: 'linkedinValidator',
      message: 'Invalid Linkedin URL',
      validator: async (_a: any, value: string) => {
        if (value === null || value === '' || value === undefined) {
          return;
        }
        const pattern = new RegExp(
          '^(https?:\\/\\/)?((www|\\w\\w)\\.)?linkedin.com\\/((in\\/[^/]+/?)|(pub\\/[^\\/]+/((\\w|\\d)+\\/?){3}))$',
          'i',
        );

        if (!value.match(pattern)) {
          throw Error('Invalid Linkedin URL');
        } else {
          return;
        }
      },
    },
    {
      name: 'blankValidator',
      message: "shouldn't be blank ",
      validator: async (_a: any, value: string) => {
        if (value === null || value === '' || value === undefined) {
          return;
        }
        const pattern = new RegExp('^\\s*$', 'i');

        if (value.match(pattern)) {
          throw Error('white space ');
        } else {
          return;
        }
      },
    },
    // {
    //   name: 'blankValidatorAutoComplete',
    //   message: "shouldn't be blank ",
    //   validator: async (_a: any, value: AutocompleData) => {
    //     if (value === null || value?.value === '' || value?.value === undefined) {
    //       return;
    //     }
    //     const pattern = new RegExp('^\\s*$', 'i');
    //
    //     if (value?.value.match(pattern)) {
    //       throw Error('white space ');
    //     } else {
    //       return;
    //     }
    //   },
    // },
    // {
    //   name: 'maxAutoComplete',
    //   message: "shouldn't be blank ",
    //   validator: async (_a: any, value: AutocompleData) => {
    //     if (value === null || value?.value === '' || value?.value === undefined) {
    //       return;
    //     }
    //
    //     if (value?.value.length > _a.max) {
    //       throw Error('white space ');
    //     } else {
    //       return;
    //     }
    //   },
    // },
    // {
    //   name: 'mobile',
    //   message: 'Should be Valid number',
    //   validator: async (_: any, value: string) => {
    //     if (value === undefined || isValidPhoneNumber(value)) {
    //       return;
    //     }
    //     throw Error('Not a Valid Phone number');
    //   },
    // },
  ];
}
