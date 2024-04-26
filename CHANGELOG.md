# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.1.0](https://github.com/LzpTec/di/compare/v0.0.5...v0.1.0) (2024-04-26)


### ⚠ BREAKING CHANGES

* Removed string and symbol support. Use ContainerKey instead.

### Features

* Removed string and symbol support. Use ContainerKey instead. ([96ebcee](https://github.com/LzpTec/di/commit/96ebcee440a65f780680277607a21beeb09270fb))


### Bug Fixes

* Search used key in global instances. ([97adffb](https://github.com/LzpTec/di/commit/97adffbbf9f164afd4ce0d21686e611d989bfae1))
* Use Map instead of WeakMap for symbols and strings. ([0bd22e6](https://github.com/LzpTec/di/commit/0bd22e6c6f410ede25e8bbb01dce900bf0c5d1d9))

## [0.0.5](https://github.com/LzpTec/di/compare/v0.0.4...v0.0.5) (2024-04-25)


### ⚠ BREAKING CHANGES

* Removed snapshot method in favor of childs.
* Implement new Singleton and Container scopes.

### Features

* Implement new Singleton and Container scopes. ([52f45dd](https://github.com/LzpTec/di/commit/52f45dd6dd6a1f2197eccb3a74ee223017c5c240))
* Implemented container relations. ([c26fac9](https://github.com/LzpTec/di/commit/c26fac9b6a51d6324fae37fb1c28252f5c4a815a))
* new Container Scope. ([40acfbf](https://github.com/LzpTec/di/commit/40acfbfb7545c6867218f4336695974a1c50adcc))
* Removed snapshot method in favor of childs. ([e887d20](https://github.com/LzpTec/di/commit/e887d20704d6ff49c60ee595254292e7593e7adc))


### Bug Fixes

* Incorrect implementation of ContainerKeys<T>. ([4229d48](https://github.com/LzpTec/di/commit/4229d4874861f3137eb192f5144d79df620e1510))


### Docs

* Fix context scope description. ([b8987ea](https://github.com/LzpTec/di/commit/b8987ea80a49edc84875bcfd58c17ab0e6086f1e))


### Misc

* Improve container types. ([b57fc9a](https://github.com/LzpTec/di/commit/b57fc9aa8e6083da01ec95f1a98e046dcfe921d0))


### Dependencies

* Update deps. ([885da11](https://github.com/LzpTec/di/commit/885da11ab8d89c3b55a88519304c14b736f67e9e))

## [0.0.4](https://github.com/LzpTec/di/compare/v0.0.3...v0.0.4) (2024-04-17)


### ⚠ BREAKING CHANGES

* Target ES2021.

### Features

* Target ES2021. ([868148f](https://github.com/LzpTec/di/commit/868148fcc13a13b069b1572efb23441853318e75))


### Bug Fixes

* Export container key. ([52211ce](https://github.com/LzpTec/di/commit/52211cef8c858d5591ba946f1821a7a4224d2a5a))
* Export scopes. ([4990ada](https://github.com/LzpTec/di/commit/4990ada94acce23788d47ec85975d42204244c04))

## [0.0.3](https://github.com/LzpTec/di/compare/v0.0.2...v0.0.3) (2024-01-22)


### Misc

* bump nvmrc version. ([40ff218](https://github.com/LzpTec/di/commit/40ff218c78faf7d8d60fb1d74aa75dddbdd6b43b))
* Fix project url. ([b4f1bdb](https://github.com/LzpTec/di/commit/b4f1bdb7b406a4bb4e0f483e7156735090f7ac3c))
* Update TODO. ([37603da](https://github.com/LzpTec/di/commit/37603da3631e20370e49e5b32fd71f6a560cb9d8))


### Dependencies

* Update deps. ([be6019c](https://github.com/LzpTec/di/commit/be6019c1f3a59d1576a2f042609d4e575a362ec4))

## 0.0.2 (2024-01-19)


### Features

* Added context scope. ([b19b433](https://github.com/LzpTec/di/commit/b19b4338c4ce5a5467d122bffb6c7d9e4094c030))


### Bug Fixes

* ClassConstructor args ([20f4a0c](https://github.com/LzpTec/di/commit/20f4a0c7c7513203589b79f5a3a88c3efdc1e35f))


### Misc

* Change project struct. ([71de575](https://github.com/LzpTec/di/commit/71de575c91ba92dff9efe93947fa340dfd5c1456))
