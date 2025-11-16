import { dom } from "../src/js/paste-esm.js";

test("addCssClass", ()=>{
  document.body.innerHTML="<div id='x'></div>";
  const el=document.getElementById("x");
  dom.addCssClass(el,"active");
  expect(el.classList.contains("active")).toBe(true);
});
