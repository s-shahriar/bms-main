import api from "@/lib/axios";

export const fetchBuildingsApi = async () => {
	try {
		const response = await api.get("/buildings");
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching buildings:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch buildings",
		};
	}
};
