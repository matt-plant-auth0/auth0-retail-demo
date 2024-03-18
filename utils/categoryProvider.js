import { fetchInventory } from './inventoryProvider'

async function fetchCategories () {
  const categories = (await fetchInventory()).reduce((acc, next) => {
    next.categories.map(category => {
      if (acc.includes(category)) return
      acc.push(category)
    })
    return acc
  }, [])
  console.log(categories);
  return Promise.resolve(categories)
}

export default fetchCategories