const API_URL = "http://localhost:3000/api/feedback";

let feedbackData = [];
let currentPage = 1;
const itemsPerPage = 5;

// Fetch feedback from backend
async function fetchFeedback() {
  try {
    const response = await fetch(API_URL);
    feedbackData = await response.json();
    renderFeedback();
  } catch (error) {
    console.error("Error fetching feedback:", error);
    alert("Failed to load feedback data");
  }
}

function renderFeedback() {
  const searchQuery = document
    .getElementById("searchFeedback")
    .value.toLowerCase();

  const filteredData = feedbackData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery) ||
      item.email.toLowerCase().includes(searchQuery) ||
      item.event.toLowerCase().includes(searchQuery) ||
      item.division.toLowerCase().includes(searchQuery)
  );

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedData = filteredData.slice(start, end);

  const tableBody = document.getElementById("feedbackTable");
  tableBody.innerHTML = "";

  paginatedData.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.email}</td>
      <td>${item.event}</td>
      <td>${item.division}</td>
      <td>${"★".repeat(item.rating)} ${item.rating}/5</td>
      <td><span class="badge ${
        item.status === "open" ? "bg-success" : "bg-secondary"
      }">${item.status}</span></td>
      <td>${new Date(item.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-success btn-sm" onclick="editFeedback('${item.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteFeedback('${item.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  renderPagination(filteredData.length);
}

function renderPagination(totalItems) {
  const pageCount = Math.ceil(totalItems / itemsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= pageCount; i++) {
    const pageItem = document.createElement("li");
    pageItem.classList.add("page-item");
    if (i === currentPage) {
      pageItem.classList.add("active");
    }
    pageItem.innerHTML = `<a class="page-link" href="javascript:void(0);" onclick="goToPage(${i})">${i}</a>`;
    pagination.appendChild(pageItem);
  }
}

function goToPage(page) {
  currentPage = page;
  renderFeedback();
}

function refreshPage() {
  document.getElementById("searchFeedback").value = "";
  currentPage = 1;
  fetchFeedback();
}

function editFeedback(id) {
  const item = feedbackData.find(f => f.id === id);
  if (!item) {
    alert("Feedback not found.");
    return;
  }

  document.getElementById("editFeedbackId").value = item.id;
  document.getElementById("editName").value = item.name;
  document.getElementById("editEmail").value = item.email;
  document.getElementById("editEvent").value = item.event;
  document.getElementById("editDivision").value = item.division;
  document.getElementById("editStatus").value = item.status;
  document.getElementById("editComments").value = item.comments || "";
  document.getElementById("editSuggestions").value = item.suggestions || "";

  // Set the rating
  document.querySelectorAll('input[name="rating"]').forEach(radio => {
    radio.checked = (radio.value === String(item.rating));
  });

  const modal = new bootstrap.Modal(document.getElementById("editModal"));
  modal.show();
}

document
  .getElementById("editFeedbackForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("editFeedbackId").value;
    const updatedFeedback = {
      name: document.getElementById("editName").value,
      email: document.getElementById("editEmail").value,
      event: document.getElementById("editEvent").value,
      division: document.getElementById("editDivision").value,
      rating: parseInt(document.querySelector('input[name="rating"]:checked').value),
      status: document.getElementById("editStatus").value,
      comments: document.getElementById("editComments").value,
      suggestions: document.getElementById("editSuggestions").value,
    };

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFeedback),
      });

      if (response.ok) {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editModal")
        );
        modal.hide();
        fetchFeedback();
        alert("Feedback updated successfully!");
      } else {
        alert("Failed to update feedback");
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
      alert("Error updating feedback");
    }
  });

async function deleteFeedback(id) {
  if (!confirm("Are you sure you want to delete this feedback?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log(`[SUCCESS] Feedback with ID ${id} deleted successfully.`);
      fetchFeedback();
    } else {
      console.error(`[ERROR] Failed to delete feedback with ID ${id}`);
      alert("Failed to delete feedback");
    }
  } catch (error) {
    console.error("Error deleting feedback:", error);
    alert("Error deleting feedback");
  }
}

// Load feedback when page loads
fetchFeedback();