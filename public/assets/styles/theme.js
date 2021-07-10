import { createMuiTheme } from '@material-ui/core/styles';
import { red, orange } from '@material-ui/core/colors';

// Create a theme instance.
const theme = createMuiTheme({
    palette: {
        primary: {
            main: orange[500],
        },
        secondary: {
            main: '#4d4546',
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#000000',
        },
    },
});

export default theme;