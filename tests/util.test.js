import { util } from "../src/js/paste-esm.js";

test("trim works", ()=>{expect(util.trim("  hi ")).toBe("hi");});
