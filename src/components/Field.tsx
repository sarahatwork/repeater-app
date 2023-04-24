import React, { useEffect, useState } from "react";
import { EditorToolbarButton } from "@contentful/forma-36-react-components";
import tokens from "@contentful/forma-36-tokens";
import { FieldExtensionSDK } from "@contentful/app-sdk";
import { v4 as uuid } from "uuid";

import {
  Button,
  Table,
  FormControl,
  TextInput,
} from "@contentful/f36-components";

import { PlusCircleIcon } from "@contentful/f36-icons";

interface FieldProps {
  sdk: FieldExtensionSDK;
}

/** An Item which represents an list item of the repeater app */
interface Item {
  id: string;
  key: string;
  value: string;
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
 */
function createItem(): Item {
  return {
    id: uuid(),
    key: "",
    value: "",
  };
}

/** The Field component is the Repeater App which shows up
 * in the Contentful field.
 *
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {
  const { valueName = "Value" } = props.sdk.parameters.instance as any;
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    // This ensures our app has enough space to render
    props.sdk.window.startAutoResizer();

    // Every time we change the value on the field, we update internal state
    props.sdk.field.onValueChanged((value: Item[]) => {
      if (Array.isArray(value)) {
        setItems(value);
      }
    });
  });

  /** Adds another item to the list */
  const addNewItem = () => {
    props.sdk.field.setValue([...items, createItem()]);
  };

  /** Creates an `onChange` handler for an item based on its `property`
   * @returns A function which takes an `onChange` event
   */
  const createOnChangeHandler =
    (item: Item, property: "key" | "value") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const itemList = items.concat();
      const index = itemList.findIndex((i) => i.id === item.id);

      itemList.splice(index, 1, { ...item, [property]: e.target.value });

      props.sdk.field.setValue(itemList);
    };

  /** Deletes an item from the list */
  const deleteItem = (item: Item) => {
    props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
  };

  return (
    <div>
      <Table>
        <Table.Body>
          {items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>
                <FormControl id="key">
                  <FormControl.Label>Item Name</FormControl.Label>
                  <TextInput
                    name="key"
                    value={item.key}
                    onChange={createOnChangeHandler(item, "key")}
                  />
                </FormControl>
              </Table.Cell>
              <Table.Cell>
                <FormControl id="value">
                  <FormControl.Label>{valueName}</FormControl.Label>
                  <TextInput
                    name="value"
                    value={item.value}
                    onChange={createOnChangeHandler(item, "value")}
                  />
                </FormControl>
              </Table.Cell>
              <Table.Cell align="right">
                <EditorToolbarButton
                  label="delete"
                  icon="Delete"
                  onClick={() => deleteItem(item)}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Button
        variant="transparent"
        onClick={addNewItem}
        startIcon={<PlusCircleIcon />}
        style={{ marginTop: tokens.spacingS }}
      >
        Add Item
      </Button>
    </div>
  );
};

export default Field;
