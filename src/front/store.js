// src/front/store.js

export const initialStore = () => {
	return {
		message: null,
		user: null,
		token: localStorage.getItem("token") || null
	};
};

export default function storeReducer(store, action = {}) {
	switch(action.type){

		case 'login':

			localStorage.setItem("token", action.payload.token);

			return {
				...store,
				token: action.payload.token,
				user: action.payload.user
			};

		case 'logout':

			localStorage.removeItem("token");

			return {
				...store,
				token: null,
				user: null
			};

		case 'set_user':

			return {
				...store,
				user: action.payload
			};

		default:
			throw Error('Unknown action.');
	}
}