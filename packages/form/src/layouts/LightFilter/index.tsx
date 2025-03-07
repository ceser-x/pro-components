import React, { useState, useContext, useEffect } from 'react';
import { FormProps } from 'antd/lib/form/Form';
import { ConfigContext } from 'antd/lib/config-provider/context';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import classNames from 'classnames';
import { Form } from 'antd';
import { FieldDropdown, FieldLabel } from '@ant-design/pro-utils';
import { useIntl } from '@ant-design/pro-provider';
import BaseForm, { CommonFormProps } from '../../BaseForm';
import './index.less';

export interface LightFilterProps extends FormProps, CommonFormProps {
  collapse?: boolean;
  collapseLabel?: React.ReactNode;
  bordered?: boolean;
}

const LightFilterContainer: React.FC<{
  items: React.ReactNode[];
  prefixCls: string;
  size?: SizeType;
  values?: object;
  onValuesChange: (values: object) => void;
  collapse?: boolean;
  collapseLabel?: React.ReactNode;
  bordered?: boolean;
}> = (props) => {
  const {
    items,
    prefixCls,
    size,
    collapse,
    collapseLabel,
    onValuesChange,
    bordered,
    values = {},
  } = props;
  const intl = useIntl();
  const lightFilterClassName = `${prefixCls}-light-filter`;
  const outsideItems: React.ReactNode[] = [];
  const collapseItems: React.ReactNode[] = [];

  const [open, setOpen] = useState<boolean>(false);
  const [moreValues, setMoreValues] = useState<object>(() => {
    return { ...values };
  });
  useEffect(() => {
    setMoreValues({ ...values });
  }, [values]);
  items.forEach((item: any) => {
    const { secondary, name } = item.props || {};
    if ((secondary && !values[name]) || collapse) {
      collapseItems.push(item);
    } else {
      outsideItems.push(item);
    }
  });

  return (
    <div className={classNames(lightFilterClassName, `${lightFilterClassName}-${size}`)}>
      <div className={`${lightFilterClassName}-container`}>
        {outsideItems.map((child: any) => {
          const { key } = child;
          return (
            <div className={`${lightFilterClassName}-item`} key={key}>
              {React.cloneElement(child, {
                // proFieldProps 会直接作为 ProField 的 props 传递过去
                proFieldProps: {
                  light: true,
                  label: child.props.label,
                  bordered,
                },
                bordered,
              })}
            </div>
          );
        })}
        {collapseItems.length ? (
          <div className={`${lightFilterClassName}-item`} key="more">
            <FieldDropdown
              padding={24}
              onVisibleChange={setOpen}
              visible={open}
              label={
                collapseLabel || (
                  <FieldLabel
                    size={size}
                    label={intl.getMessage('form.lightFilter.more', '更多筛选')}
                    expanded={open}
                  />
                )
              }
              footer={{
                onConfirm: () => {
                  onValuesChange({
                    ...moreValues,
                  });
                  setOpen(false);
                },
                onClear: () => {
                  const clearValues = {};
                  Object.keys(moreValues).forEach((key) => {
                    clearValues[key] = undefined;
                  });
                  setMoreValues(clearValues);
                },
              }}
            >
              {collapseItems.map((child: any) => {
                const { key } = child;
                const { name, fieldProps } = child.props;
                return (
                  <div className={`${lightFilterClassName}-line`} key={key}>
                    {React.cloneElement(child, {
                      fieldProps: {
                        ...fieldProps,
                        [child.props.valuePropName || 'value']: moreValues[name],
                        onChange: (e: any) => {
                          setMoreValues({
                            ...moreValues,
                            [name]: e?.target ? e.target.value : e,
                          });
                          return false;
                        },
                      },
                    })}
                  </div>
                );
              })}
            </FieldDropdown>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const LightFilter: React.FC<LightFilterProps> = (props) => {
  const {
    size,
    collapse,
    collapseLabel,
    initialValues,
    onValuesChange,
    form: userForm,
    bordered,
    ...reset
  } = props;
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('pro-form');
  const [form] = Form.useForm();
  const realForm = userForm || form;
  const [values, setValues] = useState<object>(() => {
    return { ...initialValues };
  });
  return (
    <BaseForm
      size={size}
      initialValues={initialValues}
      form={realForm}
      contentRender={(items) => (
        <LightFilterContainer
          prefixCls={prefixCls}
          items={items}
          size={size}
          bordered={bordered}
          collapse={collapse}
          collapseLabel={collapseLabel}
          values={values}
          onValuesChange={(newValues) => {
            const newAllValues = {
              ...values,
              ...newValues,
            };
            setValues(newAllValues);
            realForm.setFieldsValue(newAllValues);
            realForm.submit();
            if (onValuesChange) {
              onValuesChange(newValues, newAllValues);
            }
          }}
        />
      )}
      formItemProps={{
        colon: false,
        labelAlign: 'left',
      }}
      fieldProps={{
        style: {
          width: undefined,
        },
      }}
      {...reset}
      onValuesChange={(_, allValues) => {
        setValues(allValues);
        if (onValuesChange) {
          onValuesChange(_, allValues);
        }
        realForm.submit();
      }}
    />
  );
};

export default LightFilter;
