import styles from './page.module.css';
import {Button} from "antd";
import Form, {setValidationErrors} from "@sezenta/antd-schema-form";

export default async function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.css file.
   */
  return (
    <div className={styles.page}>
      <Form layout="vertical">
        <Form.Items schema={[
          {name: 'test', type: 'date', id: 'test'}
        ]}/>
      </Form>
    </div>
  );
}
