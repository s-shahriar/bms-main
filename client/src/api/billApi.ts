import api from "@/lib/axios";
import type { CreateBillData } from "@/pages/ManageBillsPage";

export const fetchBillsApi = async (page: number, limit: number, all: boolean) => {
	try {
		const response = await api.get(`/bills?page=${page}&limit=${limit}&all=${all}`);
		// console.log("Bills fetched successfully:", response.data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching bills:", error.response?.data);
		return { success: false, error: error.response?.data?.message || "Failed to fetch bills" };
	}
};

export const createBillApi = async (data: CreateBillData) => {
	try {
		const response = await api.post("/bills/create", data);
		// console.log("Bill created successfully:", response.data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error creating bill:", error.response?.data);
		return { success: false, error: error.response?.data?.message || "Failed to create bill" };
	}
};

export const uploadBillsApi = async (data: any) => {
	try {
		const response = await api.post("/bills/upload", data);
		// console.log("Bills uploaded successfully:", response.data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error uploading bills:", error.response?.data);
		return { success: false, error: error.response?.data?.message || "Failed to upload bills" };
	}
};

export const updateBillApi = async (billId: string, data: Partial<CreateBillData>) => {
	try {
		const response = await api.put(`/bills/${billId}`, data);
		// console.log("Bill updated successfully:", response.data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error updating bill:", error.response?.data);
		return { success: false, error: error.response?.data?.message || "Failed to update bill" };
	}
};

export const deleteBillApi = async (billId: string) => {
	try {
		const response = await api.delete(`/bills/${billId}`);
		// console.log("Bill deleted successfully:", response.data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error deleting bill:", error.response?.data);
		return { success: false, error: error.response?.data?.message || "Failed to delete bill" };
	}
};

export const fetchFlatBillsApi = async (
	flatId: string,
	page: number,
	limit: number,
	all: boolean,
	unpaid: boolean
) => {
	try {
		const response = await api.get(
			`/bills/flat/${flatId}?page=${page}&limit=${limit}&all=${all}&unpaid=${unpaid}`
		);
		// console.log("Bills for this flat fetched successfully:", response.data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching bills for this flat:", error.response?.data);
		return { success: false, error: error.response?.data?.message || "Failed to fetch bills" };
	}
};

export const fetchFlatBillRemainingApi = async (flatId: string) => {
	try {
		const response = await api.get(`/bills/flat/remaining/${flatId}`);
		// console.log("Bill remaining for this flat fetched successfully:", response.data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching bill remaining for this flat:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch bill remaining",
		};
	}
};
