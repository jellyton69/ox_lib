import { Group, Modal, Button, Stack } from '@mantine/core';
import React, { FormEvent, useRef } from 'react';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { useLocales } from '../../providers/LocaleProvider';
import { fetchNui } from '../../utils/fetchNui';
import { IInput, ICheckbox, ISelect, INumber, ISlider } from '../../interfaces/dialog';
import InputField from './components/fields/input';
import CheckboxField from './components/fields/checkbox';
import SelectField from './components/fields/select';
import NumberField from './components/fields/number';
import SliderField from './components/fields/slider';
import { useFieldArray, useForm } from 'react-hook-form';

export interface InputProps {
  heading: string;
  rows: Array<IInput | ICheckbox | ISelect | INumber | ISlider>;
}

export type FormValues = {
  test: {
    value: any;
  }[];
};

const InputDialog: React.FC = () => {
  const [fields, setFields] = React.useState<InputProps>({
    heading: '',
    rows: [{ type: 'input', label: '' }],
  });
  const [inputData, setInputData] = React.useState<Array<string | number | boolean>>([]);
  const [passwordStates, setPasswordStates] = React.useState<boolean[]>([]);
  const [visible, setVisible] = React.useState(false);
  const { locale } = useLocales();

  const form = useForm<{ test: { value: any }[] }>({});
  const fieldForm = useFieldArray({
    control: form.control,
    name: 'test',
  });

  const handlePasswordStates = (index: number) => {
    setPasswordStates({
      ...passwordStates,
      [index]: !passwordStates[index],
    });
  };

  useNuiEvent<InputProps>('openDialog', (data) => {
    setPasswordStates([]);
    setFields(data);
    setInputData([]);
    setVisible(true);
    data.rows.forEach((row, index) => {
      fieldForm.insert(index, { value: row.type !== 'checkbox' ? row.default : row.checked } || { value: null });
    });
  });

  useNuiEvent('closeInputDialog', () => {
    setVisible(false);
  });

  const handleClose = () => {
    setVisible(false);
    fetchNui('inputData');
  };

  const handleChange = (value: string | number | boolean, index: number) => {
    setInputData((previousData) => {
      previousData[index] = value;
      return previousData;
    });
  };

  const handleConfirm = () => {
    setVisible(false);
    fetchNui('inputData', inputData);
  };

  const onSubmit = form.handleSubmit(async (data) => {
    const values: any[] = [];
    Object.values(data.test).forEach((obj: { value: any }) => values.push(obj.value));
    console.log(values);
    await new Promise((resolve) => setTimeout(resolve, 200));
    form.reset();
    fieldForm.remove();
  });

  return (
    <>
      <Modal
        opened={visible}
        onClose={handleClose}
        centered
        closeOnClickOutside={false}
        size="xs"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && visible) return handleConfirm();
        }}
        styles={{ title: { textAlign: 'center', width: '100%', fontSize: 18 } }}
        title={fields.heading}
        withCloseButton={false}
        overlayOpacity={0.5}
        transition="fade"
        exitTransitionDuration={150}
      >
        <form onSubmit={onSubmit}>
          <Stack>
            {fieldForm.fields.map((item, index) => {
              const row = fields.rows[index];
              return (
                <React.Fragment key={item.id}>
                  {row.type === 'input' && (
                    <InputField
                      register={form.register(`test.${index}.value`)}
                      row={row}
                      index={index}
                      passwordStates={passwordStates}
                      handlePasswordStates={handlePasswordStates}
                    />
                  )}
                  {row.type === 'checkbox' && (
                    <CheckboxField register={form.register(`test.${index}.value`)} row={row} index={index} />
                  )}
                  {row.type === 'select' && <SelectField row={row} index={index} control={form.control} />}
                  {row.type === 'number' && <NumberField control={form.control} row={row} index={index} />}
                  {row.type === 'slider' && <SliderField control={form.control} row={row} index={index} />}
                </React.Fragment>
              );
            })}
            <Group position="right" spacing={10}>
              <Button uppercase variant="default" onClick={handleClose} mr={3}>
                {locale.ui.cancel}
              </Button>
              <Button uppercase variant="light" onClick={handleClose} type="submit">
                {locale.ui.confirm}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};

export default InputDialog;
