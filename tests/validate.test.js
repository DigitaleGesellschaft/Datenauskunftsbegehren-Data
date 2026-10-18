import fs from "fs";
import { parse } from "yaml";
import { join } from "path";
import * as z from "zod";
import { describe, test, expect } from "vitest";
import {
  OrgSchema,
  DesireSchema,
  TypeSchema,
  EventSchema,
  HistorySchema,
} from "../definitions/schemas.js";

function list_yaml(path) {
  return fs.readdirSync(path);
}

function read_yaml(fp) {
  return parse(fs.readFileSync(fp, { encoding: "utf-8" }));
}

function validate(data, schema) {
  const result = schema.safeParse(data);
  if (result.error) {
    return result.error.issues;
  }
  return null;
}

// a symbolic link could pull any file of the machine into the published JSON
// (see tasks/compile-json.mjs)
test("data contains no symbolic links", () => {
  const links = fs
    .readdirSync("data", { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isSymbolicLink())
    .map((entry) => join(entry.parentPath, entry.name));
  expect(links).toEqual([]);
});

// the generator puts the texts into its HTML, partly without escaping them
test("texts must not contain markup", () => {
  const org = {
    name: "Test AG",
    address: "Test AG\n<img src=x onerror=alert(1)>",
    sources: { address: "https://test.example/kontakt" },
  };
  expect(validate(org, OrgSchema)?.[0].path).toEqual(["address"]);
  expect(
    validate({ handle: "x", label: "<b>x</b>", paragraphs: [] }, EventSchema),
  ).toBeTruthy();
});

test("sources must be web addresses", () => {
  const org = { name: "Test AG", address: "Test AG" };
  for (const address of ["javascript:alert(1)", "file:///etc/passwd"]) {
    expect(validate({ ...org, sources: { address } }, OrgSchema)).toBeTruthy();
  }
  for (const address of ["https://test.example", "http://test.example"]) {
    expect(
      validate({ ...org, sources: { address } }, OrgSchema),
    ).not.toBeTruthy();
  }
});

describe.each(list_yaml("data/events"))("event yaml", (fn) => {
  test(`${fn}`, () => {
    expect(
      validate(read_yaml(join("data/events", fn)), EventSchema),
    ).not.toBeTruthy();
  });
});

const org_listing = list_yaml("data/orgs");
//const org_listing = ["Blick.yml"];

describe.each(org_listing)("org yaml", (fn) => {
  test(`${fn}`, () => {
    expect(
      validate(read_yaml(join("data/orgs", fn)), OrgSchema),
    ).not.toBeTruthy();
  });
});

describe.each(list_yaml("data/types"))("type yaml", (fn) => {
  test(`${fn}`, () => {
    expect(
      validate(read_yaml(join("data/types", fn)), TypeSchema),
    ).not.toBeTruthy();
  });
});

describe.each(list_yaml("data/desires"))("desire yaml", (fn) => {
  test(`${fn}`, () => {
    expect(
      validate(read_yaml(join("data/desires", fn)), DesireSchema),
    ).not.toBeTruthy();
  });
});

test("history schema", () => {
  const yd = `
  action: removed
  date: '2021-06-05T00:00:00.000Z'
  reason: 'Die Firma XY....'
  `;
  expect(validate(parse(yd), HistorySchema)).not.toBeTruthy();
});
