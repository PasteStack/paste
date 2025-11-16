import { lru } from "../src/js/paste-esm.js";

test("LRU evicts", ()=>{
  const c=new lru(2);
  c.set("a",1); c.set("b",2); c.get("a"); c.set("c",3);
  expect(c.get("b")).toBeUndefined();
});
