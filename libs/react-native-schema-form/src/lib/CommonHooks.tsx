import {useCallback, useState} from 'react';
import {FormInstance} from 'rc-field-form';

export const useFormErrors = (
  form: FormInstance,
): [Record<string, string> | undefined, (errors: any) => boolean] => {
  const [errors, setErrs] = useState<Record<string, string>>();
  const setErrorsInternal = useCallback((errs: any) => {
    if (!errs) {
      setErrs(undefined);
    } else if (Array.isArray(errs)) {
      setErrs(
        Object.fromEntries(errs.map((err: any) => [err.name, err.errors[0]])),
      );
    } else {
      setErrs(
        Object.fromEntries(
          errs.errorFields.map((err: any) => [err.name, err.errors[0]]),
        ),
      );
    }
  }, []);
  const setErrors = useCallback(
    (errs: any) => {
      if (errs.name === 'AxiosError') {
        if (errs?.response?.data) {
          const err = Object.entries(
            (errs?.response.data as any).validationErrors,
          ).map(e => ({
            name: e[0].split('.'),
            errors: [e[1]] as string[],
          }));
          form.setFields(err);
          setErrorsInternal(err);
          return true;
        }
      } else {
        setErrorsInternal(errs);
      }
      return false;
    },
    [form, setErrorsInternal],
  );
  return [errors, setErrors];
};
