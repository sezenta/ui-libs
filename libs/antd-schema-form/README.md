# Dynamic Schema Form Library for React Antd

Welcome to our Dynamic Schema Form Library for React Antd, a powerful solution designed to streamline and simplify the creation of forms in your React applications. Leveraging the flexibility of JSON Schema, this library offers an efficient way to generate dynamic forms, making it easier than ever to collect, validate, and manage user input.

## ✨ Features

- Simplified Form Management
- Enhanced User Experience
- Reduced Development Time
- Increased Consistency and Reliability

## 📦 Install

```bash
npm install @sezenta/antd-schema-form
```

```bash
yarn add @sezenta/antd-schema-form
```

```bash
pnpm add @sezenta/antd-schema-form
```

## 🔨 Usage

```tsx
import {Button, DatePicker} from 'antd';
import Form, { FormSchema } from '@sezenta/antd-schema-form';

// You can keep this JSON at database or in code. 
const schema: FormSchema = [
  {
    id: 'email',
    type: 'email',
    name: 'Email',
    props: {placeholder: 'example@email.com'},
    options: {
      rules: [
        {required: true, message: 'Username is required'},
        {type: 'email', message: 'This should be an email'},
      ],
    },
  },
  {
    id: 'password',
    type: 'password',
    name: 'Password',
    props: {placeholder: 'Password'},
    options: {
      rules: [{required: true, message: 'Password is required'}],
    },
  },
];

export const LoginForm: FC = () => {
  const onFinish = (values) => {
    // Handle form values
  }
  return (
    <Form onFinish={onFinish}>
      <Form.Items schema={schema}/>
    </Form>
  );
};
```

## FormSchema interface

This take an array of ```FormField```. i.e. ```FormField[]```.

### FormField interface

| Prop name | Description                                                                                     | Default value | Example values                                                      |
|-----------|-------------------------------------------------------------------------------------------------|---------------|---------------------------------------------------------------------|
| id        | The field id. This is the property name of the object created by the form                       | N/A           | name                                                                |
| name      | The label that should appear with the form field                                                | N/A           | Name                                                                |
| type      | The field type. You can use common adapters or your own adapters that compatible with antd form | string        | string                                                              | 
| props     | Any additional props that need to pass to control                                               | N/A           | ```{placeholder: 'Test'}```                                         |
| options   | Options that should given as antd field options including form validations                      | N/A           | ```{ rules: [{required: true, message: 'Password is required'}]}``` |
| visible   | Visibility function or boolean to show/hide                                                     | true          | ```(value, form, parentPath) => { return value.name === 'test'}```  |
| layout    | Antd ColProps for responsive grid design                                                        | undefined     | ```{ sm: 12, md: 8 }```                                             |

### Available Common Adapters

| name     | Description         |
|----------|---------------------|
| string   | Single line input   | 
| password | Password field      |
| text     | Text area           |
| number   | Number input        |
| hidden   | Hidden field        |
| email    | Email input field   | 
| date     | Date input          |
| radio    | Antd Radio Group    | 
| check    | Antd Checkbox Group |
| bookean  | Checkbox input      | 
| search   | Antd Input.Search   | 
| select   | Antd Select         |
| rate     | Antd Rate           |
| slider   | Antd Slider         |
| time     | Antd TimePicker     |
| tree     | Antd TreeSelect     |

## Why Dynamic Schema Form?

In the development of web applications, form creation is a fundamental yet often complex task. Forms are the primary method for collecting user input, and their significance cannot be overstated. However, as applications grow in complexity, so does the challenge of managing forms that are responsive, user-friendly, and efficient. This is where our Dynamic Schema Form Library comes in, addressing several critical needs:

### Simplified Form Management

By defining forms through JSON Schema, developers can abstract the form layout and validation logic from the UI code. This separation simplifies form management, allowing for quick adjustments to form fields, validation rules, and appearance without deep dives into the UI codebase.

### Enhanced User Experience

Dynamic forms adapt to user input in real-time, providing an interactive and intuitive user experience. Whether it's conditionally showing or hiding fields, dynamically adjusting options, or providing instant validation feedback, our library ensures users have a seamless and efficient interaction with your application.

### Reduced Development Time

With the Dynamic Schema Form Library, the time and effort required to create and maintain forms are significantly reduced. Developers can focus on the schema definition, and the library takes care of rendering the form UI, managing state, and handling validations. This efficiency accelerates the development process, allowing teams to deliver features faster.

### Increased Consistency and Reliability

Utilizing JSON Schema as the foundation for form creation promotes consistency across your application's forms. It ensures that data validation follows a standardized approach, reducing errors and improving data integrity. Moreover, by centralizing the form definitions, your application gains in maintainability and scalability.

## Key Features

- **JSON Schema Compatibility**: Fully supports JSON Schema for defining form structure and validation, offering a versatile and powerful way to describe your forms.
- **Dynamic Form Generation**: Automatically generates forms based on your JSON Schema definition, including complex nested structures and arrays.
- **Real-time Validation**: Provides immediate feedback on user input based on the validation rules defined in the JSON Schema, enhancing the user experience.
- **Conditional Logic**: Supports conditional fields and sections, allowing forms to adapt based on user input and ensuring that users are only presented with relevant questions.
- **Customizable UI**: While the library handles the heavy lifting, it offers flexibility in styling and customizing the appearance of your forms to match your application's design system.

## Getting Started

To start using the Dynamic Schema Form Library in your project, follow our simple setup and integration guide. [Here, you'd typically include a link to your installation instructions, basic usage examples, and API documentation.]

Join us in simplifying form creation and management in React applications. With the Dynamic Schema Form Library, harness the power of JSON Schema to deliver dynamic, user-friendly forms with ease.
