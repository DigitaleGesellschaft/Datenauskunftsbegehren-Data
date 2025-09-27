import * as z from "zod";

export const dateStringSchema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()); // Checks if the date is valid
  },
  {
    message: "Invalid date string",
  },
);

// models/Paragraph.js
export const variableRegExp =
  /\{(?<type>string|number|tel|email|date)?(?::)?(?<name>[a-zA-Z]{1,})(?::)?(?<label>[a-zA-Z-. ]{0,})\}/g;

const UniqueString = z.string().register(z.globalRegistry, {
  id: "unique_string",
  title: "A string that should be unique among each data type in data folder",
});

const Label = z.string().register(z.globalRegistry, {
  id: "label",
  title: "A translatable label that appears on the website",
});

export const VariableString = z
  .string()
  .refine(
    (val) => {
      const braceCount = (val.match(/\{/g) || []).length;
      const matches = [...val.matchAll(variableRegExp)];
      return matches.length === braceCount;
    },
    {
      message:
        "Inconsistent variable placeholders found. Check with the defined regex in the docs",
    },
  )
  .register(z.globalRegistry, {
    id: "variable_string",
    title: "Variable String",
    description: `A string that is used inside the letter that may contain variable placeholders. Variable placeholders must match: '${variableRegExp}'`,
    examples: [
      "Am {date:eventDate:Wann} habe ich von Ihnen ein Werbemail an die Adresse {email:eventEmail:E-Mail-Adresse} gesendet bekommen",
      "Unter personenbezogene Daten sind insbesondere auch die folgenden in Ihrer Datenschutzerklärung vom {string:privacyStatementDate} aufgeführten Kategorien...",
    ],
  });

export const EventSchema = z
  .object({
    handle: UniqueString,
    label: Label,
    paragraphs: z.array(z.string()),
  })
  .register(z.globalRegistry, {
    title: "Trigger event for the data inquiry",
    description:
      "Event types that are displayed on the landing page as the reason for the data inquiry",
  });

export const TypeSchema = z
  .object({
    handle: UniqueString,
    label: Label,
    serviceLabel: Label,
    paragraphs: z.array(z.string()),
  })
  .register(z.globalRegistry, {
    title: "Type of Service or Service Category",
    description:
      "Schema for the types yml files. Used on the website to filter a company by service type encoded by the handle field",
    examples: ["Parking", "Gastronomy", "Mobile Provider", "Address Trade"],
  });

const HistoryAction = z.enum(["removed"]);

// models/History.js
export const HistorySchema = z
  .object({
    action: HistoryAction,
    date: dateStringSchema,
    reason: z.string(),
  })
  .register(z.globalRegistry, {
    title: "History Record for an Org",
    description:
      "History records for keep old data but mark them as removed on organization not existing anymore",
  });

// models/Bullet.js
export const BulletsSchema = z
  .union([
    z.string(), // Simple bullet
    z.object({
      text: z.string(),
      get bullets() {
        return z.array(BulletsSchema);
      },
    }), // Nested bullets
  ])
  .register(z.globalRegistry, {
    id: "bullet",
    title: "A bullet point",
    description:
      "Bullet points for inline text as either a simple string or another bullet point",
  });

// models/PrivacyStatement.js
export const PrivacyStatementSchema = z
  .object({
    paragraphs: z.array(VariableString).optional(),
    variables: z
      .object({
        privacyStatementDate: z.string(),
      })
      .optional(),
    bullets: z.array(BulletsSchema).optional(),
  })
  .register(z.globalRegistry, {
    title: "A companies privacy statement",
    description:
      "A summary of the privacy statements of a company together with an optional date when the privacy statement was in force",
  });

export const OrgType = z.enum([
  "gastro",
  "credit",
  "address",
  "online",
  "wlan",
  "mobility",
  "payback",
  "mobile",
  "parkingprovider",
]);

// see svelte code models/org.js what is optional and what not
export const OrgSchema = z
  .object({
    name: z.string(),
    address: z.string(),
    types: z.array(OrgType).optional(),
    privacyStatement: PrivacyStatementSchema.optional(),
    // sources is not used inside the frontend code and stripped
    sources: z.object({
      address: z.string().url(),
      privacyStatement: z.array(z.string().url()).optional(),
    }),
    history: z.array(HistorySchema).optional(),
  })
  .register(z.globalRegistry, {
    title: "Record for an organization for a yml file",
    description:
      "Data object containing necessary information for a company to construct letters",
  });

export const DesireSchema = z
  .object({
    handle: z.string(),
    label: z.string(),
    paragraphs: z.array(z.string()).optional(),
  })
  .register(z.globalRegistry, {
    title: "Desire schema for a yml file",
    description:
      "Defines the handle to appear in the url, the label that appears on the landing page and the paragraphs to render for the letter",
  });
