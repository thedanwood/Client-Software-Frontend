import { VLegend } from "../types/shared";

const datatableConfig = {
  quoteLegend: {
    legends: [
      {
        text: "Haulage Only",
        class: "key-border-left-grey",
      },
      {
        text: "Supply and Delivery",
        class: "key-border-left-blue",
      },
    ],
  } as VLegend,
};

export default datatableConfig;
