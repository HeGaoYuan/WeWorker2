import React from 'react'

/**
 * Fluent UI: panel-left-20-regular — Copyright (c) Microsoft Corporation.
 * https://github.com/microsoft/fluentui-system-icons (MIT License)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * System UIcons: panel-left — Corey Ginnivan, Unlicense (public domain).
 * https://github.com/CoreyGinnivan/system-uicons
 * Original icon paths are preserved. The collapsed icon is scaled to match
 * the expanded icon's outer bounds (x: 2–18, y: 4–16 in the 20px viewBox).
 */
export default function SidebarToggleIcon({ collapsed, size = 16 }) {
  return (
    <svg className="app-sidebar-toggle-icon" data-icon={collapsed ? 'system-uicons:panel-left' : 'fluent:panel-left-20-regular'} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      {collapsed ? (
        <svg x="2" y="4" width="16" height="12" viewBox="3 3 15 15" preserveAspectRatio="none" overflow="visible">
          <path fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M5.5 3.5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2m0 11v-8" />
        </svg>
      ) : (
        <path fill="currentColor" d="M15 4a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zM8.5 15H15a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8.5zM5 5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2.5V5z" />
      )}
    </svg>
  )
}
