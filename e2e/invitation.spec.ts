import { expect, test } from '@playwright/test'

test('desktop journey reaches and downloads the final calendar file', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Свиданко-селектор' })).toBeVisible()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'artifacts/desktop-start.png', fullPage: true })
  await page.getByRole('button', { name: /Таня/ }).click()
  await expect(page.getByRole('heading', { name: 'Таня, идём на свиданку?' })).toBeVisible()

  const noButton = page.getByRole('button', { name: 'Нет' })
  const before = await noButton.boundingBox()
  await noButton.hover({ force: true })
  await page.waitForTimeout(300)
  const after = await noButton.boundingBox()
  expect(after?.width).toBeLessThan(before?.width ?? 0)

  await page.getByRole('button', { name: /Да, конечно/ }).click()
  await expect(page.getByRole('heading', { name: 'Выбираем дату' })).toBeVisible()
  await page.getByRole('button', { name: /25 Сентябрь 2026/ }).click()
  await expect(page.getByText(/Юра прилетает днём/)).toBeVisible()
  await page.getByRole('button', { name: /Дата годится/ }).click()
  await page.getByRole('button', { name: /Домашняя киношечка/ }).click()
  await page.getByRole('button', { name: /План утверждён/ }).click()
  await page.getByRole('button', { name: 'У Тани дома' }).click()
  await page.getByRole('button', { name: '«Евротур»' }).click()
  await page.getByRole('button', { name: /Кино выбрано/ }).click()
  await page.getByRole('button', { name: 'Твой вариант' }).click()
  await page.getByRole('textbox').fill('Хачапури и лимонад')
  await page.getByRole('button', { name: /К финальному протоколу/ }).click()

  await expect(page.getByRole('heading', { name: 'Свиданка собрана' })).toBeVisible()
  await expect(page.getByText('Хачапури и лимонад')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Таня и Юра' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Поделиться/ })).toHaveCount(0)
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'artifacts/desktop-summary.png', fullPage: true })

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Скачать для календаря/ }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('svidanka-2026-09-25.ics')
  await context.close()
})

test('touch rejection responds and calendar fits a mobile viewport', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  await page.goto('/')
  await page.getByRole('button', { name: /Танюха/ }).tap()
  await expect(page.getByRole('heading', { name: 'Танюха, идём на свиданку?' })).toBeVisible()

  const noButton = page.getByRole('button', { name: 'Нет' })
  const before = await noButton.boundingBox()
  await noButton.tap()
  await expect(page.getByText('Неправильный ответ')).toBeVisible()
  await page.waitForTimeout(300)
  const after = await noButton.boundingBox()
  expect(after?.width).toBeLessThan(before?.width ?? 0)

  await page.getByRole('button', { name: /Да, конечно/ }).tap()
  await expect(page.getByRole('heading', { name: 'Выбираем дату' })).toBeVisible()
  await expect(page.getByText('Неправильный ответ')).toBeHidden()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'artifacts/mobile-calendar.png', fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await context.close()
})