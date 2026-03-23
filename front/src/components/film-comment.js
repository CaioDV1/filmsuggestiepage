/* dit is het component dat de film comments weergeeft, hier kunnen gebruikers comments en sterren achterlaten bij een film
de comments worden opgeslagen in de backend en gedeeld met andere gebruikers die de film bekijken via websockets */

import {
  fetchCommentsByQid,
  getFilmQid,
  postCommentByQid
} from "../lib/comments-api.js"

class FilmComments extends HTMLElement {
  constructor() {
    super()
    this.comments = []
    this.selectedStars = 0
    this.currentUserName = ""
    this.isLoading = true
    this.errorMessage = ""
    this._eventsBound = false
    this.ws = null
    this.qid = ""
  }

  async connectedCallback() {
    const film = this.getFilm()

    if (!film) {
      this.innerHTML = "<p>Geen film gevonden.</p>"
      return
    }

    this.qid = getFilmQid(film)
    this.currentUserName = localStorage.getItem("film-comments-current-user") || ""

    this.render()
    this.addEvents()
    this.connectWebSocket()
    await this.loadCommentsFromBackend()
  }

  disconnectedCallback() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  getFilm() {
    const raw = this.getAttribute("data-film")

    if (!raw) return null

    try {
      return JSON.parse(decodeURIComponent(raw))
    } catch {
      return null
    }
  }

  getWsUrl() {
   return 'wss://backendfilmsuggestiepage.onrender.com'
  }

  connectWebSocket() {
    if (!this.qid) return

    this.ws = new WebSocket(this.getWsUrl())

    this.ws.addEventListener("open", () => {
      this.ws.send(
        JSON.stringify({
          type: "join",
          qid: this.qid,
          sender: this.currentUserName || "anon"
        })
      )
    })

    this.ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.qid !== this.qid) return

        if (data.type === "message") {
          this.comments.push({
            user: data.sender,
            text: data.text,
            stars: data.stars
          })

          this.render()

          window.dispatchEvent(
            new CustomEvent("comments-updated", {
              detail: { qid: this.qid }
            })
          )
        }
      } catch (error) {
        console.error("Kon websocket bericht niet verwerken:", error)
      }
    })

    this.ws.addEventListener("error", (error) => {
      console.error("WebSocket fout:", error)
    })
  }

  async loadCommentsFromBackend() {
    if (!this.qid) {
      this.isLoading = false
      this.errorMessage = "Deze film heeft geen geldige QID."
      this.render()
      return
    }

    this.isLoading = true
    this.errorMessage = ""
    this.render()

    try {
      const data = await fetchCommentsByQid(this.qid)
      this.comments = Array.isArray(data.comments) ? data.comments : []
    } catch (error) {
      console.error("Kon comments niet laden:", error)
      this.errorMessage = "Kon comments niet laden."
    } finally {
      this.isLoading = false
      this.render()
    }
  }

  renderStars() {
    let starsHtml = ""

    for (let i = 1; i <= 5; i += 1) {
      starsHtml += `
        <button
          type="button"
          class="film-chat__star ${i <= this.selectedStars ? "is-active" : ""}"
          data-stars="${i}"
          aria-label="${i} ster${i > 1 ? "ren" : ""}"
        >
          ${i <= this.selectedStars ? "★" : "☆"}
        </button>
      `
    }

    return starsHtml
  }

  renderComments() {
    if (this.isLoading) {
      return '<div class="film-chat__empty">Comments laden...</div>'
    }

    if (this.errorMessage) {
      return `<div class="film-chat__empty">${this.errorMessage}</div>`
    }

    if (!this.comments.length) {
      return '<div class="film-chat__empty">Nog geen comments.</div>'
    }

    return this.comments
      .map((comment) => {
        const firstLetter = comment.user?.charAt(0)?.toUpperCase() || "?"
        const stars = "★".repeat(comment.stars || 0)
        const isOwn = this.currentUserName && comment.user === this.currentUserName

        return `
          <article class="film-chat__message ${isOwn ? "film-chat__message--own" : "film-chat__message--other"}">
            <div class="film-chat__avatar">${firstLetter}</div>
            <div class="film-chat__bubble">
              <div class="film-chat__meta">
                <span class="film-chat__sender">${comment.user}</span>
                <span class="film-chat__rating">${stars}</span>
              </div>
              <p class="film-chat__text">${comment.text}</p>
            </div>
          </article>
        `
      })
      .join("")
  }

  render() {
    this.innerHTML = `
      <section class="film-chat">
        <div class="film-chat__header">
          <h3 class="film-chat__title">Comments</h3>
        </div>

        <div class="film-chat__messages">
          ${this.renderComments()}
        </div>

        <form class="film-chat__composer">
          <div class="film-chat__toprow">
            <input
              type="text"
              class="film-chat__name"
              placeholder="Jouw naam"
              name="commentName"
              autocomplete="name"
              value="${this.currentUserName}"
            />

            <div class="film-chat__stars">
              ${this.renderStars()}
            </div>
          </div>

          <div class="film-chat__bottomrow">
            <textarea
              class="film-chat__input"
              placeholder="Schrijf een comment..."
              name="commentText"
              rows="2"
            ></textarea>

            <app-button
              class="film-chat__send"
              type="submit"
              variant="primary"
              label="Plaatsen"
            ></app-button>
          </div>
        </form>
      </section>
    `
  }

  updateStars() {
    const stars = this.querySelectorAll(".film-chat__star")

    stars.forEach((star) => {
      const value = Number(star.dataset.stars)
      const active = value <= this.selectedStars

      star.textContent = active ? "★" : "☆"
      star.classList.toggle("is-active", active)
    })
  }

  async handleSubmit() {
    const nameInput = this.querySelector(".film-chat__name")
    const textInput = this.querySelector(".film-chat__input")

    const name = nameInput?.value.trim() || ""
    const text = textInput?.value.trim() || ""

    if (!this.qid) {
      alert("Deze film heeft geen geldige QID.")
      return
    }

    if (!name || !text || !this.selectedStars) {
      alert("Vul je naam, comment en sterren in.")
      return
    }

    try {
      localStorage.setItem("film-comments-current-user", name)
      this.currentUserName = name

      await postCommentByQid(this.qid, {
        user: name,
        text,
        stars: this.selectedStars
      })

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: "message",
            qid: this.qid,
            sender: name,
            text,
            stars: this.selectedStars
          })
        )
      } else {
        this.comments.push({ user: name, text, stars: this.selectedStars })
      }

      textInput.value = ""
      this.selectedStars = 0
      this.render()
    } catch (error) {
      console.error("Kon comment niet opslaan:", error)
      alert(error.message || "Kon comment niet opslaan.")
    }
  }

  addEvents() {
    if (this._eventsBound) return
    this._eventsBound = true

    this.addEventListener("click", (event) => {
      const star = event.target.closest(".film-chat__star")

      if (!star) return

      this.selectedStars = Number(star.dataset.stars)
      this.updateStars()
    })

    this.addEventListener("keydown", (event) => {
      const textarea = event.target.closest(".film-chat__input")

      if (!textarea) return

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        const form = this.querySelector(".film-chat__composer")
        form?.requestSubmit()
      }
    })

    this.addEventListener("change", (event) => {
      const nameInput = event.target.closest(".film-chat__name")

      if (!nameInput) return

      this.currentUserName = nameInput.value.trim()
      localStorage.setItem("film-comments-current-user", this.currentUserName)

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: "join",
            qid: this.qid,
            sender: this.currentUserName || "anon"
          })
        )
      }
    })

    this.addEventListener("submit", async (event) => {
      const form = event.target.closest(".film-chat__composer")

      if (!form) return

      event.preventDefault()
      await this.handleSubmit()
    })
  }
}

customElements.define("film-comments", FilmComments)