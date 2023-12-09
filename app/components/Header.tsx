import { AppBar } from '@mui/material'
import DesktopMenu from './Menu/Desktop'
import MobileMenu from './Menu/Mobile'

export type PageLinks = { title: string; href: string }[]

// наш додаток складається з 3 сторінок:
// Головний, Блога та Контактів
const PAGE_LINKS = [
  { title: 'Home', href: '/' },
  { title: 'Posts', href: '/posts' },
  { title: 'About', href: '/about' }
]

export default function Header() {
  return (
    <AppBar position='relative'>
      {/* в залежності від ширини екрана рендері або десктопне меню, будь-яке мобільне */}
      <DesktopMenu links={PAGE_LINKS} />
      <MobileMenu links={PAGE_LINKS} />
    </AppBar>
  )
}