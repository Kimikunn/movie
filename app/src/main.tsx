import { createRoot } from 'react-dom/client'
import { isPlatform, setupIonicReact } from '@ionic/react'
import {
  iosTransitionAnimation,
  popoverEnterAnimation,
  popoverLeaveAnimation,
} from '@rdlabo/ionic-theme-ios26'

import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/flex-utils.css'

import '@fontsource/outfit/300.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/700.css'
import '@fontsource/outfit/800.css'
import '@fontsource/outfit/900.css'

import '@rdlabo/ionic-theme-ios26/dist/css/default-variables.css'
import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css'
import '@rdlabo/ionic-theme-ios26/dist/css/md-remove-ios-class-effect.css'

import './index.css'
import App from './App.tsx'

setupIonicReact({
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
  popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
  popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
})

createRoot(document.getElementById('root')!).render(
  <App />,
)
