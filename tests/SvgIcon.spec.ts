import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { shallowMount, mount } from '@vue/test-utils'
import SvgIcon from '@/components/SvgIcon.vue'
import '@/components/icons'

// Type helper for accessing component internals
type ComponentVM = any

describe('SvgIcon.vue', () => {
    it('should load icons', () => {
        expect(Object.keys(SvgIcon.icons).length).toBeGreaterThan(1)
        expect(!!SvgIcon.icons['arrow'].data).toBe(true)
    })

    it('should mounted', () => {
        let wrapper = shallowMount(SvgIcon, {
            props: {
                name: 'arrow'
            }
        })

        expect(!!wrapper.html()).toBe(true)
    })

    describe('Prop: dir', () => {
        it('should has correct direction', () => {
            let dirs = ['left', 'up', 'right', 'down']

            dirs.forEach(dir => {
                let wrapper = shallowMount(SvgIcon, {
                    props: {
                        name: 'arrow',
                        dir: dir
                    }
                })

                expect(wrapper.classes()).toContain(
                    `svg-${dir}`
                )

                // Can't contains other dir
                expect(
                    dirs.filter(v => v != dir).map(v => `svg-${v}`).some(c => wrapper.classes().includes(c))
                ).toBe(false)
            })
        })
    })

    describe('Prop: fill', () => {
        it('should has fill style by default.', () => {
            let wrapper = shallowMount(SvgIcon, {
                props: {
                    name: 'arrow'
                }
            })
            expect((wrapper.vm as ComponentVM).fill).toBe(true)
            expect(wrapper.classes()).toContain('svg-fill')
        })

        it('should has stroke style by default when use isStroke option', () => {
            let wrapper = shallowMount(SvgIcon, {
                props: {
                    name: 'arrow'
                },
                global: {
                    plugins: [[SvgIcon, {
                        isStroke: true
                    }]]
                }
            })

            expect((wrapper.vm as ComponentVM).fill).toBe(false)
            expect(wrapper.classes()).not.toContain('svg-fill')

            // Reset the global isStroke state by re-installing with default options
            SvgIcon.install({ component: () => {} } as any, {})
        })
    })

    describe('Prop: color', () => {
        let wrapper: any

        beforeEach(() => {
            wrapper = mount(SvgIcon, {
                props: {
                    name: 'arrow'
                }
            })
        })

        it('should be green', async () => {
            await wrapper.setProps({
                name: 'arrow',
                color: 'green'
            })

            let path = wrapper.vm.$el.querySelector('path')
            expect(!!path).toBe(true)
            expect(path && path.getAttribute('fill')).toBe('green')
        })

        it('should has red and green color', async () => {
            await wrapper.setProps({
                name: 'vue',
                color: 'red green'
            })
            let paths = wrapper.vm.$el.querySelectorAll('path')
            paths.forEach((path: Element, ix: number) => {
                expect(path.getAttribute('fill')).toBe(['red', 'green'][ix])
            })
        })

        it('r-color', async () => {
            await wrapper.setProps({
                name: 'arrow',
                color: 'r-red'
            })
            let path = wrapper.vm.$el.querySelector('path')
            expect(!!path).toBe(true)
            expect(path && path.getAttribute('fill')).toBe('none')
            expect(path && path.getAttribute('stroke')).toBe('red')
        })

        it('multi r-color', async () => {
            await wrapper.setProps({
                name: 'vue',
                color: 'red r-green'
            })
            let paths = wrapper.vm.$el.querySelectorAll('path')
            paths.forEach((path: Element, ix: number) => {
                if (ix === 0) {
                    expect(path.getAttribute('fill')).toBe('red')
                    expect(path.getAttribute('stroke')).toBe('none')
                } else {
                    expect(path.getAttribute('fill')).toBe('none')
                    expect(path.getAttribute('stroke')).toBe('green')
                }
            })
        })

        it('gradient', async function() {
            await wrapper.setProps({
                name: 'vue',
                color: 'url(#gradient-1) url(#gradient-2)'
            })
            let $el = wrapper.vm.$el

            $el.querySelectorAll('path').forEach((path: Element, ix: number) => {
                expect(path.getAttribute('fill')).toBe(
                    ['url(#gradient-1)', 'url(#gradient-2)'][ix]
                )
            })
        })
    })

    describe('prop size (width/height/scale)', function() {
        let wrapper: any

        beforeEach(() => {
            wrapper = mount(SvgIcon, {
                props: {
                    name: 'arrow'
                }
            })
        })

        it('size should be 50px/40px', async () => {
            await wrapper.setProps({
                width: '50',
                height: '40'
            })

            let $el = wrapper.vm.$el as HTMLElement
            expect($el.style.width).toBe('50px')
            expect($el.style.height).toBe('40px')
        })

        it('size should be 10em/10em', async () => {
            await wrapper.setProps({
                width: '10em',
                height: '10em'
            })

            let $el = wrapper.vm.$el as HTMLElement
            expect($el.style.width).toBe('10em')
            expect($el.style.height).toBe('10em')
        })

        it('size should be 40px/70px', async () => {
            await wrapper.setProps({
                scale: '10'
            })

            let $el = wrapper.vm.$el as HTMLElement
            expect($el.style.width).toBe('40px')
            expect($el.style.height).toBe('70px')
        })

        it('size should be 40px/70px', async () => {
            await wrapper.setProps({
                scale: '10',
                width: '50',
                height: '50'
            })

            let $el = wrapper.vm.$el as HTMLElement
            expect($el.style.width).toBe('40px')
            expect($el.style.height).toBe('70px')
        })
    })

    describe('unique id', () => {
        let arrow = shallowMount(SvgIcon, {
            props: {
                name: 'arrow'
            }
        })

        let arrowFit = shallowMount(SvgIcon, {
            props: {
                name: 'sora/arrow/fit'
            }
        })

        it('should not has same id', () => {
            let html1 = arrow.html()
            let html2 = arrowFit.html()

            function findIds(html: string): string[] {
                let reg = /\sid=\"([\w-])+\"/g
                return html.match(reg) || []
            }

            let ids1 = findIds(html1)
            let ids2 = findIds(html2)

            expect(ids1.every(v => ids2.indexOf(v) < 0)).toBe(true)
        })
    })
})
