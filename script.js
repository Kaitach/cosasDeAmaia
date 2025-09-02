// Global variables
let babyItems = []
let currentView = "cards" // Added view state tracking
let currentSort = "original" // original, completed-first, pending-first

// DOM element
const itemsContainer = document.getElementById("items-container")
const completedCount = document.getElementById("completed-count")
const pendingCount = document.getElementById("pending-count")
const totalCount = document.getElementById("total-count")
const cardViewBtn = document.getElementById("card-view-btn")
const listViewBtn = document.getElementById("list-view-btn")
const sortBtn = document.getElementById("sort-btn")

// Load items from JSON
async function loadItems() {
  try {
    const response = await fetch("items.json")
    if (!response.ok) {
      throw new Error("Error loading items.json")
    }
    babyItems = await response.json()
    renderItems()
    updateStats()
  } catch (error) {
    console.error("Error loading baby items:", error)
    showErrorMessage()
  }
}

// Render items to the DOM
function renderItems() {
  itemsContainer.innerHTML = ""

  const itemsToRender = sortItems()

  if (currentView === "cards") {
    itemsContainer.className = "items-grid"
    itemsToRender.forEach((item, index) => {
      const itemCard = createItemCard(item, index)
      itemsContainer.appendChild(itemCard)
    })
  } else {
    itemsContainer.className = "items-list"
    itemsToRender.forEach((item, index) => {
      const itemRow = createItemListRow(item, index)
      itemsContainer.appendChild(itemRow)
    })
  }
}

// Create individual item card
function createItemCard(item, index) {
  const card = document.createElement("div")
  card.className = `item-card ${item.completed ? "completed" : "pending"}`

  // Add staggered animation delay
  card.style.animationDelay = `${index * 0.1}s`

  card.innerHTML = `
        <h3 class="item-name">${item.name}</h3>
        <p class="item-description">${item.description}</p>
        <div class="item-status">
            <span class="status-icon"></span>
            ${item.completed ? "Listo ♥" : "Aún falta 🍼"}
        </div>
    `

  return card
}

function createItemListRow(item, index) {
  const row = document.createElement("div")
  row.className = `item-list-row ${item.completed ? "completed" : "pending"}`

  // Add staggered animation delay
  row.style.animationDelay = `${index * 0.05}s`

  row.innerHTML = `
    <div class="list-status-icon">
      ${item.completed ? "♥" : "🍼"}
    </div>
    <div class="list-item-content">
      <div class="list-item-name">${item.name}</div>
      <div class="list-item-description">${item.description}</div>
    </div>
  `

  return row
}

// Update statistics
function updateStats() {
  const completed = babyItems.filter((item) => item.completed).length
  const pending = babyItems.filter((item) => !item.completed).length
  const total = babyItems.length

  // Animate numbers
  animateNumber(completedCount, completed)
  animateNumber(pendingCount, pending)
  animateNumber(totalCount, total)
}

// Animate number counting
function animateNumber(element, targetNumber) {
  const startNumber = 0
  const duration = 1000
  const startTime = performance.now()

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * progress)
    element.textContent = currentNumber

    if (progress < 1) {
      requestAnimationFrame(updateNumber)
    }
  }

  requestAnimationFrame(updateNumber)
}

// Show error message if JSON fails to load
function showErrorMessage() {
  itemsContainer.innerHTML = `
        <div class="error-message" style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            color: #f44336;
        ">
            <h3>Error al cargar los elementos</h3>
            <p>No se pudo cargar el archivo items.json. Asegúrate de que el archivo existe y es válido.</p>
        </div>
    `
}

function switchView(view) {
  currentView = view

  // Update button states
  cardViewBtn.classList.toggle("active", view === "cards")
  listViewBtn.classList.toggle("active", view === "list")

  // Re-render items with new view
  renderItems()
}

function sortItems() {
  const sortedItems = [...babyItems]

  switch (currentSort) {
    case "completed-first":
      sortedItems.sort((a, b) => b.completed - a.completed)
      break
    case "pending-first":
      sortedItems.sort((a, b) => a.completed - b.completed)
      break
    default:
      // Keep original order
      break
  }

  return sortedItems
}

function cycleSortOrder() {
  const sortOptions = ["original", "completed-first", "pending-first"]
  const sortLabels = {
    original: "Orden Original",
    "completed-first": "Listos Primero",
    "pending-first": "Pendientes Primero",
  }

  const currentIndex = sortOptions.indexOf(currentSort)
  const nextIndex = (currentIndex + 1) % sortOptions.length
  currentSort = sortOptions[nextIndex]

  // Update button text
  const sortLabel = sortLabels[currentSort]
  sortBtn.innerHTML = `<span class="view-icon">⇅</span>${sortLabel}`

  // Re-render items with new sort
  renderItems()
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  loadItems()

  cardViewBtn.addEventListener("click", () => switchView("cards"))
  listViewBtn.addEventListener("click", () => switchView("list"))
  sortBtn.addEventListener("click", cycleSortOrder)
})

// Add some interactive effects
document.addEventListener("DOMContentLoaded", () => {
  // Add smooth scrolling for better UX
  document.documentElement.style.scrollBehavior = "smooth"

  // Add intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running"
      }
    })
  }, observerOptions)

  // Observe all item cards when they're created
  const observeCards = () => {
    const cards = document.querySelectorAll(".item-card")
    cards.forEach((card) => observer.observe(card))
  }

  // Call after items are loaded
  setTimeout(observeCards, 100)
})
