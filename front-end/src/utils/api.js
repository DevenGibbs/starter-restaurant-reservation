/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
// "https://dlg-reservations-back-end.herokuapp.com";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservations.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Retrieves the reservation with the associated 'reservation_id'
 * @param reservation_id
 * the 'reservation_id' property matching the desired reservation
 * @param signal
 * optional AbortController.signal
 * @returns {Promise<Error>}
 * a promise that resolves to a possible error, if the reservation does not exist.
 */
export async function readReservation(reservation_id, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}`;
  return await fetchJson(url, { signal }, {});
}

/**
 * Saves a newly created reservation to the database.
 * @param reservation
 * Does not include 'reservation_id' property
 * Must have 'first_name', 'last_name', 'mobile_number', 'reservation_date', 'reservation_time', and 'people' properties.
 * @param signal
 * optional AbortController.signal
 * @returns {Promise<reservation>}
 * a promise that resolves the saved reservation.
 * Adds a 'reservation_id' and 'status' property with the default value of "booked".
 */
export async function createReservation(reservation, signal) {
  const url = `${API_BASE_URL}/reservations`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }),
    signal,
  };
  return await fetchJson(url, options, {});
}

/**
 * Updates the status of an existing reservation
 * @param updatedReservation
 * the reservation to update, which must have a 'status' property
 * @param signal
 * optional AbortController.signal
 * @returns {Promise<Error>}
 * a promise that resolves to the updated status of a reservations
 */
export async function updateReservationStatus(updatedReservation, signal) {
  const url = `${API_BASE_URL}/reservations/${updatedReservation.reservation_id}/status`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: updatedReservation }),
    signal,
  };
  return await fetchJson(url, options, updatedReservation);
}

/**
 * Retrieves all existing tables.
 * @returns {Promise<[table]>}
 *  a promise that resolves to a possibly empty array of tables saved in the database.
 */
export async function listTables(signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  return await fetchJson(url, { headers, signal }, []);
}

/**
 * Deletes the 'reservation_id' preoperty associated with a specific 'table_id'
 * @param table_id
 * the id of the table to update
 * @param signal
 * optional AbortController.signal
 * @returns {Promise<Error>}
 * a promise that resolves to an object with a null 'reservation_id'
 */
export async function deleteTableReservation(table_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = { method: "DELETE", signal };
  return await fetchJson(url, options);
}

/**
 * Updates an existing reservation
 * @param updatedReservation
 * the reservation to save, which must have a 'reservation_id' property
 * @param signal
 * optional AbortController.signal
 * @returns {Promise<Error>}
 * a promise that resolves to the updated reservation
 */
export async function updateReservation(updatedReservation, signal) {
  const url = `${API_BASE_URL}/reservations/${updatedReservation.reservation_id}`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: updatedReservation }),
    signal,
  };
  return await fetchJson(url, options, updatedReservation);
}

/**
 * Saves a newly created table to the database.
 * @param table
 * Does not include 'table_id' property
 * Must have 'table_name' and 'capacity' properties.
 * @param signal
 * optional AbortController.signal
 * @returns {Promise<table>}
 * a promise that resolves the saved table.
 * Adds a 'table_id'  property
 */
export async function createTable(table, signal) {
  const url = `${API_BASE_URL}/tables`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: table }),
    signal,
  };
  return await fetchJson(url, options, {});
}

/**
 * Updates an existing table
 * @param updatedTable
 *  the table to save, which must have a 'table_id' property
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<Error>}
 * a pomise that resolves to the updated table and updates reservation 'status' to be "seated"
 */
export async function updateTable(updatedTable, signal) {
  const url = `${API_BASE_URL}/tables/${updatedTable.table_id}/seat`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: updatedTable }),
    signal,
  };
  return await fetchJson(url, options, updatedTable);
}
