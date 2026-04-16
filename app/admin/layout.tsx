import { DataProvider } from '../context/DataContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DataProvider>{children}</DataProvider>
}
