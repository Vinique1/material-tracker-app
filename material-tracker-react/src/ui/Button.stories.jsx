import React from 'react';
import Button from './Button';

export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    children: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'yellow'],
    },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Primary Button',
  variant: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Secondary Button',
  variant: 'secondary',
};

export const Danger = Template.bind({});
Danger.args = {
  children: 'Danger Button',
  variant: 'danger',
};

export const Yellow = Template.bind({});
Yellow.args = {
  children: 'Yellow Button',
  variant: 'yellow',
  className: 'max-w-xs'
};

export const IsLoading = Template.bind({});
IsLoading.args = {
  children: 'Will not show',
  variant: 'primary',
  isLoading: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  children: 'Disabled Button',
  variant: 'primary',
  disabled: true,
};