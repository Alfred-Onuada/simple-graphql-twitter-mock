import Toast from 'react-native-root-toast';

export default function showToast({ msg, danger }: { msg: string, danger?: boolean }) {
  const toast = Toast.show(msg, {
    animation: true,
    duration: Toast.durations.LONG,
    backgroundColor: danger ? "#f72f2f" : "rgb(29, 155, 240)",
    textColor: "#fff",
    containerStyle: {
      marginBottom: 60
    },
    textStyle: {
      fontFamily: "DMSans-Regular",
      fontSize: 16,
      paddingVertical: 5,
      paddingHorizontal: 25
    }
  })
}