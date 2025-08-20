import axios from "axios";

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.phone) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare the data for Bitrix24 API
    const bitrixData = {
      fields: {
        UF_CRM_DEAL_1652196828525: "Bayut Leads",
        UF_CRM_1749797976461: data.title || "Generic",
        SOURCE_ID: "UC_YJDI1J",
        PHONE: [
          {
            VALUE: data.phone,
            VALUE_TYPE: "WORK"
          }
        ],
        EMAIL: [
          {
            VALUE: data.email,
            VALUE_TYPE: "WORK"
          }
        ],
        NAME: data.name
      }
    };

    // Optional fields
    if (data.interest) {
      bitrixData.fields.UF_CRM_1666273404 = data.interest;
    }

    if (data.preferredContact) {
      bitrixData.fields.UF_CRM_1749797214 = data.preferredContact;
    }

    if (data.message) {
      bitrixData.fields.UF_CRM_1663405913 = data.message;
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
