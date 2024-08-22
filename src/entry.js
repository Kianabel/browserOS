//compontents

import "./components/window-manager.js"
import "./components/taskbar.js"

//applications

import * as AppSettings from "./applications/app-settings.js";
import * as RandomSlideshow from "./applications/app-slideshow.js"

export const availableApplications = [AppSettings,RandomSlideshow];