import { invoke } from "@tauri-apps/api/tauri"

import { readBinaryFile } from "@tauri-apps/api/fs"
import { resolveResource } from "@tauri-apps/api/path"

let greetInputEl: HTMLInputElement | null
let greetMsgEl: HTMLElement | null

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    })
  }
  try {
    const resource = await resolveResource("files.zip")
    console.log(resource)
  } catch (err) {
    console.error(err)
  }
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input")
  greetMsgEl = document.querySelector("#greet-msg")
  document
    .querySelector("#greet-button")
    ?.addEventListener("click", () => greet())
})
