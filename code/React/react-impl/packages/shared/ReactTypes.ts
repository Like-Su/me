export type Type = any;
export type Key = any;
export type Ref = any;
export type Props = any;
export type ElmentType = any;

export interface ReactElementType {
  $$typeof: symbol | number;
  type: ElmentType;
  key: Key;
  props: Props;
  ref: Ref;
}