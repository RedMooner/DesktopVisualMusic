using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;


namespace Reader
{
    class Program
    {
       // public static System.Text.Encoding OutputEncoding = UTF8Encoding.Default;
        static void Main(string[] args)
        {

            // \native\language\ru.json для дебага и
            // \resources\language\ru.json для билда
            var rootPath = AppDomain.CurrentDomain.BaseDirectory;
            //if(Directory.Exists(Path.Combine(rootPath, "resources")))
            //{
             //   rootPath = Path.Combine(rootPath, "resources");
           // }
            //System.Windows.Forms.MessageBox.Show(rootPath);
            var culture = System.Globalization.CultureInfo.CurrentCulture;
           
            try
            {
                try
                {

                    //System.Windows.Forms.MessageBox.Show(Environment.CurrentDirectory);

                    FileStream file1 = new FileStream(rootPath  + culture.ToString() + ".json", FileMode.Open); //создаем файловый поток "\\native\\language\\"
                    StreamReader reader = new StreamReader(file1); // создаем «потоковый читатель» и связываем его с файловым потоком

                    var text = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(reader.ReadToEnd()));
                    //  System.Convert.ToBase64String(reader.ReadToEnd()); - ОШИБКА
                    Console.Write(text); //считываем все данные с потока и выводим на экран
                    
                    reader.Close(); //закрываем поток
                   
                }
                catch (System.IO.DirectoryNotFoundException) {
                    System.Windows.Forms.MessageBox.Show("Err" + rootPath + "\\native\\language\\ru.json");
                }
                //FileStream file1 = new FileStream(Environment.CurrentDirectory + "native\\language\\ru.json", FileMode.Open); //создаем файловый поток
       
               // Console.ReadLine();

            }
            catch (System.IO.FileNotFoundException)
            {
                System.Windows.Forms.MessageBox.Show("Language file does not found! " + rootPath + "\\test.txt");
               // Console.ReadLine();
            }
       
           
        }
    }
}
