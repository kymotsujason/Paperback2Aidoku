# Paperback2Aidoku

This project converts the Paperback backup archive format (.pas4) to a Aidoku backup compatible JSON. Tested with a 4k+ manga library using MangaDex, MangaSee, MangaNato, and Toonily. Note: Toonily will need to be migrated after the restore or converted with another tool I made found here: [ToonilyID2Title](https://github.com/kymotsujason/ToonilyID2Title).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to utilize this project and how to install them

```
NodeJS - https://nodejs.org/en/download/package-manager/current
```

### Installing

Clone the project to your system or download the zip

```
git clone https://github.com/kymotsujason/Paperback2Aidoku.git
```

Install the dependencies from inside the root project folder

```
npm install
```

Run the dev server

```
npm run dev
```

## Deployment

Use npm run build, then npm run start. Use something like PM2 for persistence.

## Built With

* [React](https://react.dev/) - JavaScript library
* [Next.JS](https://nextjs.org/) - React Framework

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct. If you have any issues or questions, feel free to open an issue, comment on an existing issue, or ping me in the Aidoku discord (kymotsujason).

## Authors

* **Jason Yue** - *Initial work* - [kymotsujason](https://github.com/kymotsujason)

See also the list of [contributors](https://github.com/kymotsujason/paperback2aidoku/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [Tenkan](https://github.com/bdashore3/Tenkan) - source of motivation because it was outdated
* [Aidoku](https://github.com/Aidoku/Aidoku) - still testing to see if I can daily drive it over paperback