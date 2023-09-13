import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// import the fontawesome core and import config so we can set a default style
import { library, config } from '@fortawesome/fontawesome-svg-core'

// import fontawesome icon component
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// import icon style(s)
import { faSun, faMoon } from '@fortawesome/free-regular-svg-icons'

// add the icon style(s) you have installed to the library
library.add(faSun, faMoon)

config.styleDefault = 'regular'

createApp(App).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
