import axios from "axios";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log(data, "data");
    
    // Prepare the data for Bitrix24 API
    const bitrixData = {
      fields: {
        UF_CRM_1749797976461: data?.projectName || "Generic",
        SOURCE_ID: data?.source,
        PHONE: [
          {
            VALUE: data?.phone,
            VALUE_TYPE: "WORK"
          }
        ],
        EMAIL: [
          {
            VALUE: data?.email,
            VALUE_TYPE: "WORK"
          }
        ],
        NAME: data?.name
      }
    };

    // Optional fields
    if (data.interest) {
      bitrixData.fields.UF_CRM_1666273404 = data.interest;
    }
    if (data.timeToInvest) {
      bitrixData.fields.UF_CRM_1761134513560 = data.timeToInvest;
    }

    if (data.residency) {
      bitrixData.fields.UF_CRM_626BC0D089972 = data.residency;
    }

    if (data.budget) {
      bitrixData.fields.UF_CRM_62289FBA5DAFD = data.budget;
    }

    if (data.residency) {
      bitrixData.fields.UF_CRM_626BC0D089972 = data.residency;
    }

    if (data.developer) {
      bitrixData.fields.UF_CRM_1761134327531 = data.developer;
    }

    if (data.preferredContact) {
      bitrixData.fields.UF_CRM_1749797214 = data.preferredContact;
    }

    if (data.message) {
      bitrixData.fields.UF_CRM_LEAD_1686298805634 = data.message;
    }

    console.log(bitrixData, "bitrixData");
    

    // Axios POST request to Bitrix24
    const axiosResponse = await axios.post(
      process.env.BITRIX_ADD_LEADS_URL,
      bitrixData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return Response.json({ success: true, data: axiosResponse.data });
  } catch (error) {
    console.error("Error creating lead:", error.response?.data || error.message);
    return Response.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
